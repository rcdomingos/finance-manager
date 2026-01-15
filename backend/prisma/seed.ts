import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  subcategories: string[];
};

const categoriesToCreate: CategorySeed[] = [
  {
    name: "RENDA",
    type: "INCOME",
    subcategories: [
      "AUXILIOS",
      "SALÁRIOS E BÔNUS",
      "VALE ALIMENTAÇÃO",
      "RENDA EXTRA",
    ],
  },
  {
    name: "TRANSPORTE",
    type: "EXPENSE",
    subcategories: [
      "COMBUSTIVEL",
      "MANUTENÇÃO DO CARRO",
      "TRANSPORTE PÚBLICO",
      "ESTACIONAMENTO E PEDÁGIO",
      "APLICATIVOS DE MOBILIDADE",
    ],
  },
  {
    name: "COMPRAS E LAZER",
    type: "EXPENSE",
    subcategories: [
      "COISAS PARA CASA",
      "ELETRÔNICOS",
      "FESTAS E ENCONTROS",
      "JOGOS",
      "PETS",
      "PRESENTES",
      "ROUPAS E ACESSÓRIOS",
    ],
  },
  {
    name: "EMERGÊNCIAS",
    type: "EXPENSE",
    subcategories: ["DESPESAS EMERGENCIAIS"],
  },
  {
    name: "IMPOSTOS E TAXAS",
    type: "EXPENSE",
    subcategories: ["IPTU", "IPVA", "IR", "LICENCIAMENTO", "MULTA"],
  },
  {
    name: "EDUCAÇÃO E DESENVOLVIMENTO",
    type: "EXPENSE",
    subcategories: ["LIVROS E MATERIAS", "CURSOS E TREINAMENTOS"],
  },
  {
    name: "EMPRÉSTIMOS",
    type: "EXPENSE",
    subcategories: ["CARTÃO DE CREDITO", "FINANCIAMENTO"],
  },
  {
    name: "ALIMENTAÇÃO",
    type: "EXPENSE",
    subcategories: ["RESTAURANTE OU DELIVERY", "SUPERMERCADOS"],
  },
  {
    name: "ASSINATURAS",
    type: "EXPENSE",
    subcategories: [
      "APLICATIVOS",
      "SERVIÇOS DIGITAIS",
      "STREAMINGS",
      "PLANO CELULAR",
    ],
  },
  {
    name: "MORADIA",
    type: "EXPENSE",
    subcategories: [
      "CONDOMINIO",
      "FINANCIAMENTO",
      "GÁS",
      "INTERNET E TELEFONE",
      "LUZ",
      "REFORMAS E MELHORIAS",
    ],
  },
  {
    name: "SAUDE E BEM-ESTAR",
    type: "EXPENSE",
    subcategories: [
      "SUPLEMENTOS",
      "ACADEMIA E FITNESS",
      "CONSULTAS E TRATAMENTOS",
      "FARMÁCIA E MEDICAMENTOS",
      "PLANOS DE SAÚDE",
    ],
  },
  {
    name: "POUPANÇA",
    type: "EXPENSE", // Tratado como saída de caixa (saving)
    subcategories: ["RESERVA DE EMERGENCIA", "RESERVA DE CURTO PRAZO"],
  },
  {
    name: "INVESTIMENTOS",
    type: "EXPENSE", // Tratado como saída de caixa (investment)
    subcategories: ["RENDA FIXA", "PROJETO FINCLASS"],
  },
  {
    name: "TRANSFERÊNCIAS E PAGAMENTOS",
    type: "TRANSFER", // Tipo especial para movimentação interna
    subcategories: [
      "CARTÃO DE CREDITO", // Pagamento da fatura
      "TRANSFERENCIAS ENTRE CONTAS",
      "TRANSFERENCIAS PARA OUTRAS PESSOAS",
    ],
  },
  {
    name: "SEGUROS",
    type: "EXPENSE",
    subcategories: [
      "SEGURO DE AUTOMÓVEL",
      "SEGURO DE VIDA",
      "SEGURO RESIDENCIAL",
    ],
  },
  {
    name: "MANUTENÇÃO E REPAROS",
    type: "EXPENSE",
    subcategories: [
      "REPAROS DE ELETRODOMÉSTICOS",
      "REPAROS DA CASA",
      "SERVIÇOS DE LIMPEZA",
    ],
  },
  {
    name: "VIAGEM",
    type: "EXPENSE",
    subcategories: [
      "PASSEIOS E LAZER",
      "HOSPEDAGEM",
      "PASSAGENS E TRANSPORTES",
      "ALIMENTAÇÃO EM VIAGEM",
    ],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Limpar banco (Ordem importa!)
  await prisma.transaction.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Database cleaned.");

  // 2. Criar Usuário de Teste (Admin)
  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@admin.com",
      passwordHash,
    },
  });

  console.log(`👤 Test User created: ${user.email} (pass: 123456)`);

  // 3. Criar Contas para este Usuário
  await prisma.bankAccount.create({
    data: {
      bankName: "Nubank (Principal)",
      initialBalance: 1500,
      currentBalance: 1500,
      isActive: true,
      userId: user.id,
    },
  });

  await prisma.bankAccount.create({
    data: {
      bankName: "Carteira",
      initialBalance: 50,
      currentBalance: 50,
      isActive: true,
      userId: user.id,
    },
  });

  // 4. Criar Cartão para este Usuário
  await prisma.creditCard.create({
    data: {
      title: "Nubank Roxinho",
      brand: "Mastercard",
      limit: 2000,
      dueDate: 10,
      closingDate: 3,
      userId: user.id,
    },
  });

  console.log("💳 Accounts and Cards created.");

  // 5. Criar Categorias para este Usuário
  for (const cat of categoriesToCreate) {
    await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        userId: user.id,
        subCategories: {
          create: cat.subcategories.map((subName) => ({
            name: subName,
            userId: user.id,
          })),
        },
      },
    });
  }

  console.log("✅ Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
