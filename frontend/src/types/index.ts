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
}
