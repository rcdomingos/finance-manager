import { api } from "../../../services/api";
import { type CreditCard } from "../../../types";

export interface CreateCardDTO {
  title: string;
  brand: string;
  limit: number;
}

export const getCards = async (): Promise<CreditCard[]> => {
  const response = await api.get<CreditCard[]>("/credit-cards");
  return response.data;
};

export const createCard = async (data: CreateCardDTO): Promise<CreditCard> => {
  const response = await api.post<CreditCard>("/credit-cards", data);
  return response.data;
};
