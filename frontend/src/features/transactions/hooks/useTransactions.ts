import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createTransaction,
  getTransactions,
  type CreateTransactionDTO,
} from "../services/api";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDTO) => createTransaction(data),
    onSuccess: () => {
      // Importante: Invalidar saldo das contas e transações
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useTransactions = (month: number, year: number) => {
  return useQuery({
    queryKey: ["transactions", month, year],
    queryFn: () => getTransactions(month, year),
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
