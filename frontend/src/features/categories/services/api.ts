import { api } from "../../../services/api";
import type { Category } from "../../../types";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/categories");
  console.log(response.data);
  return response.data;
};
