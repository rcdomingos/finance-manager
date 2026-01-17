import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  subcategories: string[];
};

const categoriesToCreate: CategorySeed[] = [
  {
    name: 'Renda',
    type: 'INCOME',
    subcategories: ['Auxílios', 'Salários e Bônus', 'Vale Alimentação', 'Renda Extra'],
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    subcategories: [
      'Combustível',
      'Manutenção do Carro',
      'Transporte Público',
      'Estacionamento e Pedágio',
      'Aplicativos de Mobilidade',
    ],
  },
  {
    name: 'Compras e Lazer',
    type: 'EXPENSE',
    subcategories: [
      'Coisas para Casa',
      'Eletrônicos',
      'Festas e Encontros',
      'Jogos',
      'Pets',
      'Presentes',
      'Roupas e Acessórios',
    ],
  },
  {
    name: 'Emergências',
    type: 'EXPENSE',
    subcategories: ['Despesas Emergenciais'],
  },
  {
    name: 'Impostos e Taxas',
    type: 'EXPENSE',
    subcategories: ['IPTU', 'IPVA', 'IR', 'Licenciamento', 'Multa'],
  },
  {
    name: 'Educação e Desenvolvimento',
    type: 'EXPENSE',
    subcategories: ['Livros e Materiais', 'Cursos e Treinamentos'],
  },
  {
    name: 'Empréstimos',
    type: 'EXPENSE',
    subcategories: ['Cartão de Crédito', 'Financiamento'],
  },
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    subcategories: ['Restaurante ou Delivery', 'Supermercados'],
  },
  {
    name: 'Assinaturas',
    type: 'EXPENSE',
    subcategories: ['Aplicativos', 'Serviços Digitais', 'Streamings', 'Plano Celular'],
  },
  {
    name: 'Moradia',
    type: 'EXPENSE',
    subcategories: [
      'Condomínio',
      'Financiamento',
      'Gás',
      'Internet e Telefone',
      'Luz',
      'Reformas e Melhorias',
    ],
  },
  {
    name: 'Saúde e Bem-Estar',
    type: 'EXPENSE',
    subcategories: [
      'Suplementos',
      'Academia e Fitness',
      'Consultas e Tratamentos',
      'Farmácia e Medicamentos',
      'Planos de Saúde',
    ],
  },
  {
    name: 'Poupança',
    type: 'EXPENSE', // Tratado como saída de caixa (saving)
    subcategories: ['Reserva de Emergência', 'Reserva de Curto Prazo'],
  },
  {
    name: 'Investimentos',
    type: 'EXPENSE', // Tratado como saída de caixa (investment)
    subcategories: ['Renda Fixa', 'Projeto Finclass'],
  },
  {
    name: 'Transferências e Pagamentos',
    type: 'TRANSFER', // Tipo especial para movimentação interna
    subcategories: [
      'Cartão de Crédito', // Pagamento da fatura
      'Transferências entre Contas',
      'Transferências para Outras Pessoas',
    ],
  },
  {
    name: 'Seguros',
    type: 'EXPENSE',
    subcategories: ['Seguro de Automóvel', 'Seguro de Vida', 'Seguro Residencial'],
  },
  {
    name: 'Manutenção e Reparos',
    type: 'EXPENSE',
    subcategories: ['Reparos de Eletrodomésticos', 'Reparos da Casa', 'Serviços de Limpeza'],
  },
  {
    name: 'Viagem',
    type: 'EXPENSE',
    subcategories: [
      'Passeios e Lazer',
      'Hospedagem',
      'Passagens e Transportes',
      'Alimentação em Viagem',
    ],
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Limpar banco (Ordem importa!)
  await prisma.transaction.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database cleaned.');

  // 2. Criar Usuário de Teste (Admin)
  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@admin.com',
      passwordHash,
    },
  });

  console.log(`👤 Test User created: ${user.email} (pass: 123456)`);

  // 3. Criar Contas para este Usuário
  await prisma.bankAccount.create({
    data: {
      bankName: 'Nubank (Principal)',
      initialBalance: 1500,
      currentBalance: 1500,
      isActive: true,
      userId: user.id,
    },
  });

  await prisma.bankAccount.create({
    data: {
      bankName: 'Carteira',
      initialBalance: 50,
      currentBalance: 50,
      isActive: true,
      userId: user.id,
    },
  });

  // 4. Criar Cartão para este Usuário
  await prisma.creditCard.create({
    data: {
      title: 'Nubank Roxinho',
      brand: 'Mastercard',
      limit: 2000,
      dueDate: 10,
      closingDate: 3,
      userId: user.id,
    },
  });

  console.log('💳 Accounts and Cards created.');

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

  console.log('✅ Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
