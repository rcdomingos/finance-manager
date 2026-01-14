import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"], // Chave única para cache
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};
