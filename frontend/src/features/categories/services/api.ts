import { api } from "../../../services/api";
import type { Category, TransactionType } from "../../../types";

export interface CreateCategoryDTO {
  name: string;
  type: TransactionType;
  subCategories: string[]; // Array of subcategory names
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");
  return response.data;
};

export const createCategory = async (
  data: CreateCategoryDTO
): Promise<Category> => {
  const response = await api.post<Category>("/categories", data);
  return response.data;
};
