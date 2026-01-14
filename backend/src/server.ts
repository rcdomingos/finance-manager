import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

import * as dotenv from "dotenv";

dotenv.config();

const app = Fastify();

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

const start = async () => {
  try {
    await app.listen({ port: 3333 });
    console.log("🔥 Server running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
