import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCards, createCard, type CreateCardDTO } from "../services/api";

export const useCards = () => {
  return useQuery({
    queryKey: ["credit-cards"],
    queryFn: getCards,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardDTO) => createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
};
