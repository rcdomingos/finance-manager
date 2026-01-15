import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction, type CreateTransactionDTO } from "../services/api";

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
