import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
  type CreateTransactionDTO,
  type TransactionFilters,
} from '../services/api';

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => createTransaction(data),
    onSuccess: () => {
      // Importante: Invalidar saldo das contas e transações
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};

export const useTransactions = (filters: TransactionFilters) => {
  return useQuery({
    queryKey: [
      'transactions',
      filters.month,
      filters.year,
      filters.type,
      filters.categoryId,
      filters.paymentMethod,
    ],
    queryFn: () => getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
};
