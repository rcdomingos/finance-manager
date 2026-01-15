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

app.register(cors);

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

app.get("/dashboard-data", async () => {
  // Busca contas
  const accounts = await prisma.bankAccount.findMany();

  // Busca cartões
  const cards = await prisma.creditCard.findMany();

  // Busca categorias com subcategorias
  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
    },
  });

  return {
    accounts,
    cards,
    categories,
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
