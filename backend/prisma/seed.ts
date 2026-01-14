import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  type: TransactionType;
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

  // 1. Limpeza do Banco (Ordem correta para evitar erro de Foreign Key)
  await prisma.transaction.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.creditCard.deleteMany();

  console.log("🧹 Database cleaned.");

  // 2. Criar Contas Padrão
  await prisma.bankAccount.create({
    data: {
      bankName: "Conta Principal (Ex: Itaú)",
      initialBalance: 0,
      currentBalance: 0,
      isActive: true,
    },
  });

  await prisma.bankAccount.create({
    data: {
      bankName: "Carteira (Dinheiro Físico)",
      initialBalance: 0,
      currentBalance: 0,
      isActive: true,
    },
  });

  // 3. Criar Cartão Padrão
  await prisma.creditCard.create({
    data: {
      title: "Cartão Principal",
      brand: "Mastercard",
      limit: 1000,
    },
  });

  console.log("💳 Accounts and Cards created.");

  // 4. Loop inteligente para criar Categorias e Subcategorias
  for (const cat of categoriesToCreate) {
    const createdCategory = await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
      },
    });

    // Prepara o array de subcategorias para inserção em massa
    const subCategoriesData = cat.subcategories.map((subName) => ({
      name: subName,
      categoryId: createdCategory.id,
    }));

    await prisma.subCategory.createMany({
      data: subCategoriesData,
    });
  }

  console.log("✅ Categories and Subcategories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
