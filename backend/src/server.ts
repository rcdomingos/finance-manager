import * as dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticate, signToken } from "./lib/auth";

dotenv.config();

const app = Fastify();
const prisma = new PrismaClient();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;

// CORS
app.register(cors, {
  origin: true, // ['http://127.0.0.1:5173']
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// --- ROTAS PÚBLICAS (AUTH) ---
app.get("/health", async () => {
  return { status: "OK", message: "API is running" };
});

// Schema Registro
const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

app.post("/auth/register", async (req, reply) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return reply.status(400).send({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  // Transaction para criar User E categorias padrão
  const user = await prisma.$transaction(async (tx) => {
    // 1. Cria Usuário
    const newUser = await tx.user.create({
      data: { name, email, passwordHash },
    });

    // 2. Cria Categorias Padrão para este usuário (Reaproveitando tua lista)
    // Exemplo simplificado para não ficar gigante, podes adicionar todas depois
    const defaultCategories = [
      { name: "Salário", type: "INCOME", subs: ["Mensal"] },
      {
        name: "Alimentação",
        type: "EXPENSE",
        subs: ["Mercado", "Restaurante"],
      },
      { name: "Moradia", type: "EXPENSE", subs: ["Aluguel", "Luz"] },
      { name: "Transporte", type: "EXPENSE", subs: ["Uber", "Gasolina"] },
    ];

    for (const cat of defaultCategories) {
      await tx.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          userId: newUser.id,
          subCategories: {
            create: cat.subs.map((sub) => ({ name: sub, userId: newUser.id })),
          },
        },
      });
    }

    // Cria uma conta "Carteira" padrão
    await tx.bankAccount.create({
      data: {
        bankName: "Carteira",
        userId: newUser.id,
        initialBalance: 0,
        currentBalance: 0,
      },
    });

    return newUser;
  });

  const token = signToken({ userId: user.id });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
});

// Schema Login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/auth/login", async (req, reply) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return reply.status(400).send({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return reply.status(400).send({ error: "Invalid credentials" });

  const token = signToken({ userId: user.id });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
});

// --- ROTAS PROTEGIDAS ---

// ROTA PARA DASHBOARD
app.get("/dashboard/summary", { preHandler: [authenticate] }, async (req) => {
  const { query } = req;
  const now = new Date();

  // Filtros de Data (Mês/Ano)
  const month = (query as any).month
    ? parseInt((query as any).month)
    : now.getMonth() + 1;
  const year = (query as any).year
    ? parseInt((query as any).year)
    : now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const userId = req.user?.id;

  // 1. Saldo Atual (Soma das Contas Bancárias)
  // Este valor é ATUAL, não depende do mês filtrado
  const balanceAgg = await prisma.bankAccount.aggregate({
    _sum: { currentBalance: true },
    where: { userId },
  });

  // 2. Receitas e Despesas (Do Mês Selecionado)
  const transactionsAgg = await prisma.transaction.groupBy({
    by: ["type"],
    _sum: { amount: true },
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  // 3. Despesas por Categoria (Para o Gráfico)
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
  });

  // Precisamos buscar os nomes das categorias (o groupBy só devolve o ID)
  // Vamos buscar todas as categorias do user para mapear
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  // Montar o objeto para o gráfico
  const chartData = expensesByCategory.map((item) => {
    const categoryName =
      categories.find((c) => c.id === item.categoryId)?.name || "Outros";
    return {
      name: categoryName,
      value: item._sum.amount || 0,
    };
  });

  // Formatar totais
  const income =
    transactionsAgg.find((t) => t.type === "INCOME")?._sum.amount || 0;
  const expense =
    transactionsAgg.find((t) => t.type === "EXPENSE")?._sum.amount || 0;
  const currentBalance = balanceAgg._sum.currentBalance || 0;

  return {
    currentBalance,
    monthIncome: income,
    monthExpense: expense,
    chartData,
  };
});

// ROTAS PARA CATEGORIAS
const createCategorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  subCategories: z.array(z.string()).optional().default([]),
});

app.get("/categories", { preHandler: [authenticate] }, async (req) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user?.id },
    include: { subCategories: true },
    orderBy: { name: "asc" },
  });
  return categories;
});

app.post("/categories", { preHandler: [authenticate] }, async (req, reply) => {
  // 1. Validar os dados de entrada
  const parseResult = createCategorySchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parseResult.error.format(),
    });
  }

  const { name, type, subCategories } = parseResult.data;

  // 2. Criar no Banco (Transaction automática do Prisma)
  try {
    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId: req.user!.id,
        // Magia do Prisma: Criar filhos (Nested Writes)
        subCategories: {
          create: subCategories.map((subName) => ({
            name: subName,
            userId: req.user!.id,
          })),
        },
      },
      include: {
        subCategories: true,
      },
    });

    return reply.status(201).send(category);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno ao criar categoria" });
  }
});

// ROTAS PARA CONTAS BANCÁRIAS
const createBankAccountSchema = z.object({
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  initialBalance: z.number().default(0),
  isActive: z.boolean().default(true),
});

app.get("/bank-accounts", { preHandler: [authenticate] }, async (req) => {
  const accounts = await prisma.bankAccount.findMany({
    where: { userId: req.user?.id },
    orderBy: { bankName: "asc" },
  });
  return accounts;
});

app.post(
  "/bank-accounts",
  { preHandler: [authenticate] },
  async (req, reply) => {
    const parseResult = createBankAccountSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Dados inválidos",
        details: parseResult.error.format(),
      });
    }

    const { bankName, initialBalance, isActive } = parseResult.data;

    try {
      const account = await prisma.bankAccount.create({
        data: {
          bankName,
          initialBalance,
          currentBalance: initialBalance, // O saldo atual começa igual ao inicial
          isActive,
          userId: req.user!.id,
        },
      });
      return reply.status(201).send(account);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao criar conta" });
    }
  }
);

// ROTAS PARA CARTÕES DE CRÉDITO
const createCreditCardSchema = z.object({
  title: z.string().min(1, "Nome do cartão é obrigatório"),
  brand: z.string().min(1, "Bandeira é obrigatória"), // Visa, Mastercard, etc.
  limit: z.number().min(0, "Limite deve ser positivo"),
  dueDate: z.number().min(1).max(31), // Valida se o dia é lógico (entre 1 e 31)
  closingDate: z.number().min(1).max(31),
  isActive: z.boolean().default(true),
});

app.get("/credit-cards", { preHandler: [authenticate] }, async (req) => {
  const cards = await prisma.creditCard.findMany({
    where: { userId: req.user?.id },
    orderBy: { title: "asc" },
  });
  return cards;
});

app.post(
  "/credit-cards",
  { preHandler: [authenticate] },
  async (req, reply) => {
    const parseResult = createCreditCardSchema.safeParse(req.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Dados inválidos",
        details: parseResult.error.format(),
      });
    }

    const { title, brand, limit, dueDate, closingDate, isActive } =
      parseResult.data;

    try {
      const card = await prisma.creditCard.create({
        data: {
          title,
          brand,
          limit,
          dueDate,
          closingDate,
          isActive,
          userId: req.user!.id,
        },
      });
      return reply.status(201).send(card);
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Erro ao criar cartão" });
    }
  }
);

// ROTA PARA TRANSAÇÕES

//Zod Schemas
const createTransactionSchema = z
  .object({
    description: z.string().min(1, "Descrição necessária"),
    amount: z.coerce.number().min(0.01, "Valor deve ser positivo"),
    date: z.coerce.date(), // Zod converte string ISO para Date object
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),

    categoryId: z.uuid(),
    subCategoryId: z.uuid(),

    // Campos opcionais dependendo do método de pagamento
    paymentMethod: z.enum(["BANK_ACCOUNT", "CREDIT_CARD"]),
    bankAccountId: z
      .union([z.uuid(), z.literal("")])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    creditCardId: z
      .union([z.uuid(), z.literal("")])
      .optional()
      .transform((val) => (val === "" ? undefined : val)),

    installments: z.number().min(1).optional().default(1),
  })
  .refine(
    (data) => {
      // Validação Customizada: Se for Conta, precisa do ID da conta
      if (data.paymentMethod === "BANK_ACCOUNT" && !data.bankAccountId)
        return false;
      // Se for Cartão, precisa do ID do cartão
      if (data.paymentMethod === "CREDIT_CARD" && !data.creditCardId)
        return false;
      return true;
    },
    {
      message: "Selecione a conta ou cartão corretamente",
      path: ["paymentMethod"],
    }
  );

const updateTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  date: z.coerce.date(),
  categoryId: z.string().uuid(),
  subCategoryId: z.string().uuid(),
});

app.post(
  "/transactions",
  { preHandler: [authenticate] },
  async (request, reply) => {
    const result = createTransactionSchema.safeParse(request.body);

    if (!result.success) {
      return reply
        .status(400)
        .send({ error: "Dados inválidos", details: result.error.format() });
    }

    const {
      description,
      amount,
      date,
      type,
      categoryId,
      subCategoryId,
      paymentMethod,
      bankAccountId,
      creditCardId,
      installments,
    } = result.data;

    const userId = request.user!.id; // Pega do token

    try {
      // PRISMA TRANSACTION: Atomicidade garantida
      await prisma.$transaction(async (tx) => {
        const numberOfInstallments = installments || 1;
        const installmentAmount = amount / numberOfInstallments;

        for (let i = 0; i < numberOfInstallments; i++) {
          const newDate = new Date(date);
          const originalDay = date.getUTCDate();
          newDate.setUTCMonth(date.getUTCMonth() + i);

          if (newDate.getUTCDate() !== originalDay) {
            newDate.setUTCDate(0);
          }

          const finalDescription =
            numberOfInstallments > 1
              ? `${description} (${i + 1}/${numberOfInstallments})`
              : description;

          // 1. Criar o Registro da Transação
          await tx.transaction.create({
            data: {
              description: finalDescription,
              amount: installmentAmount, // Salva o valor da parcela
              date: newDate,
              type,
              paymentMethod,
              userId,
              categoryId,
              subCategoryId,
              bankAccountId:
                paymentMethod === "BANK_ACCOUNT" ? bankAccountId : null,
              creditCardId:
                paymentMethod === "CREDIT_CARD" ? creditCardId : null,
            },
          });
          // 2. Atualizar Saldos (A Lógica Financeira)
          if (paymentMethod === "BANK_ACCOUNT" && bankAccountId) {
            if (type === "INCOME") {
              // Receita: Aumenta o saldo
              await tx.bankAccount.update({
                where: { id: bankAccountId },
                data: { currentBalance: { increment: amount } },
              });
            } else if (type === "EXPENSE") {
              // Despesa: Diminui o saldo
              await tx.bankAccount.update({
                where: { id: bankAccountId },
                data: { currentBalance: { decrement: amount } },
              });
            }
          }

          //TODO: Se for Cartão de Crédito, não mexemos no saldo da conta agora.
          // Futuramente, podemos ter um campo 'usedLimit' no cartão e incrementar aqui.
        }
      });

      return reply
        .status(201)
        .send({ message: "Transação criada com sucesso!" });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Erro ao processar transação" });
    }
  }
);

app.get("/transactions", { preHandler: [authenticate] }, async (req) => {
  const { query } = req;

  // Pegamos mês e ano da Query String (ex: /transactions?month=1&year=2026)
  // Se não vier, usamos a data de hoje.
  const now = new Date();
  const month = (query as any).month
    ? parseInt((query as any).month)
    : now.getMonth() + 1;
  const year = (query as any).year
    ? parseInt((query as any).year)
    : now.getFullYear();

  // Calcular o primeiro e o último dia do mês para o filtro em UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1)); // Dia 1 do mês atual
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Último dia do mês

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user?.id,
      date: {
        gte: startDate, // Maior ou igual ao dia 1
        lte: endDate, // Menor ou igual ao último dia
      },
    },
    include: {
      category: true,
      bankAccount: { select: { bankName: true } },
      creditCard: { select: { title: true } },
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions;
});

app.put(
  "/transactions/:id",
  { preHandler: [authenticate] },
  async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;

    const result = updateTransactionSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send(result.error);

    const { description, amount, date, categoryId, subCategoryId } =
      result.data;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Buscar transação antiga
        const oldTransaction = await tx.transaction.findUnique({
          where: { id, userId },
        });
        if (!oldTransaction) throw new Error("Transação não encontrada");

        // 2. Calcular diferença de saldo (Se mudou o valor e é conta bancária)
        if (
          oldTransaction.paymentMethod === "BANK_ACCOUNT" &&
          oldTransaction.bankAccountId
        ) {
          const difference = amount - oldTransaction.amount; // Novo - Velho

          if (difference !== 0) {
            if (oldTransaction.type === "EXPENSE") {
              // Se a despesa aumentou (diff > 0), reduz saldo. Se diminuiu, aumenta saldo.
              await tx.bankAccount.update({
                where: { id: oldTransaction.bankAccountId },
                data: { currentBalance: { decrement: difference } },
              });
            } else if (oldTransaction.type === "INCOME") {
              // Se receita aumentou, aumenta saldo.
              await tx.bankAccount.update({
                where: { id: oldTransaction.bankAccountId },
                data: { currentBalance: { increment: difference } },
              });
            }
          }
        }

        // 3. Atualizar Dados
        await tx.transaction.update({
          where: { id },
          data: { description, amount, date, categoryId, subCategoryId },
        });
      });

      return reply.send({ message: "Atualizado com sucesso" });
    } catch (err) {
      return reply.status(500).send({ error: "Erro ao atualizar" });
    }
  }
);

app.delete(
  "/transactions/:id",
  { preHandler: [authenticate] },
  async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.id;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Buscar transação antiga para saber o valor e conta
        const transaction = await tx.transaction.findUnique({
          where: { id, userId },
        });

        if (!transaction) throw new Error("Transação não encontrada");

        // 2. Reverter o Saldo (Se for Conta Bancária)
        if (
          transaction.paymentMethod === "BANK_ACCOUNT" &&
          transaction.bankAccountId
        ) {
          if (transaction.type === "EXPENSE") {
            // Era despesa? Devolve o dinheiro (Incrementa)
            await tx.bankAccount.update({
              where: { id: transaction.bankAccountId },
              data: { currentBalance: { increment: transaction.amount } },
            });
          } else if (transaction.type === "INCOME") {
            // Era receita? Tira o dinheiro (Decrementa)
            await tx.bankAccount.update({
              where: { id: transaction.bankAccountId },
              data: { currentBalance: { decrement: transaction.amount } },
            });
          }
        }

        // 3. Deletar o registro
        await tx.transaction.delete({ where: { id } });
      });

      return reply.status(204).send(); // No Content
    } catch (err) {
      return reply.status(500).send({ error: "Erro ao excluir" });
    }
  }
);

// SERVIDOR
const start = async () => {
  try {
    await app.listen({ port: port });
    console.log(`🔥 Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
