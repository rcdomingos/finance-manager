import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_CATEGORIES } from '../src/constants/categories.config';

const prisma = new PrismaClient();

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
  for (const cat of DEFAULT_CATEGORIES) {
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
