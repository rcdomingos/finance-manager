import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory, type CreateCategoryDTO } from "../services/api";

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => createCategory(data),
    onSuccess: () => {
      // Invalida o cache 'categories' para forçar o React Query a buscar a lista atualizada
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      //TODO: Aqui poderíamos adicionar um toast de sucesso
    },
  });
};
