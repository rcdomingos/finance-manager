import { api } from "../../../services/api";
import { type Transaction } from "../../../types";

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  categoryId: string;
  subCategoryId: string;
  paymentMethod: "BANK_ACCOUNT" | "CREDIT_CARD";
  bankAccountId?: string;
  creditCardId?: string;
}

export const createTransaction = async (data: CreateTransactionDTO) => {
  const response = await api.post("/transactions", data);
  return response.data;
};

export const getTransactions = async (month: number, year: number) => {
  const response = await api.get<Transaction[]>("/transactions", {
    params: { month, year },
  });
  return response.data;
};
