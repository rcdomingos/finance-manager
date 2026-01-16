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
      //TODO: query de dashboard, invalidaríamos também
    },
  });
};

export const useTransactions = (month: number, year: number) => {
  return useQuery({
    // A queryKey inclui as variáveis. Se month mudar, o React Query busca de novo auto.
    queryKey: ["transactions", month, year],
    queryFn: () => getTransactions(month, year),
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
