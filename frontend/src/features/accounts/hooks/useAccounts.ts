import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccounts,
  createAccount,
  type CreateAccountDTO,
} from "../services/api";

// Hook para buscar
export const useAccounts = () => {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: getAccounts,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para criar
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountDTO) => createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });
};
