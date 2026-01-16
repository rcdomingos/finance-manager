export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  subCategories: SubCategory[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  currentBalance: number;
  isActive: boolean;
}

export interface CreditCard {
  id: string;
  title: string;
  limit: number;
  brand: string;
  dueDate: number;
  closingDate: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  paymentMethod: "BANK_ACCOUNT" | "CREDIT_CARD";
  date: string;
  category: { name: string };
  subCategory: { name: string };
  bankAccount?: { bankName: string };
  creditCard?: { title: string };
}
