import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import * as dotenv from "dotenv";

dotenv.config();

const app = Fastify();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

app.register(cors);

app.get("/health", async () => {
  return { status: "OK", message: "API is running" };
});

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

app.get("/categories", async () => {
  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return categories;
});

app.post("/categories", async (request, reply) => {
  // 1. Validar os dados de entrada
  const parseResult = createCategorySchema.safeParse(request.body);

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
        // Magia do Prisma: Criar filhos (Nested Writes)
        subCategories: {
          create: subCategories.map((subName) => ({ name: subName })),
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

app.get("/bank-accounts", async () => {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { bankName: "asc" },
  });
  return accounts;
});

app.post("/bank-accounts", async (request, reply) => {
  const parseResult = createBankAccountSchema.safeParse(request.body);

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
      },
    });
    return reply.status(201).send(account);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao criar conta" });
  }
});

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
