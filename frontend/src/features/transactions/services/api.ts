import { api } from '../../../services/api';
import { type Transaction } from '../../../types';

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId: string;
  subCategoryId: string;
  paymentMethod: 'BANK_ACCOUNT' | 'CREDIT_CARD';
  bankAccountId?: string;
  creditCardId?: string;
  installments?: number;
}

export interface TransactionFilters {
  month: number;
  year: number;
  type?: string;
  categoryId?: string;
  paymentMethod?: string;
}

export const createTransaction = async (data: CreateTransactionDTO) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const getTransactions = async (filters: TransactionFilters) => {
  // O Axios serializa o objeto em query params automaticamente (ex: ?month=1&type=EXPENSE)
  const response = await api.get<Transaction[]>('/transactions', {
    params: filters,
  });
  return response.data;
};

export const deleteTransaction = async (id: string) => {
  await api.delete(`/transactions/${id}`);
};

export const updateTransaction = async (id: string, data: any) => {
  await api.put(`/transactions/${id}`, data);
};
