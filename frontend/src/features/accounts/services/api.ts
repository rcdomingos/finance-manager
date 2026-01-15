import { api } from "../../../services/api";
import { type BankAccount } from "../../../types";

export interface CreateAccountDTO {
  bankName: string;
  initialBalance: number;
  isActive: boolean;
}

export const getAccounts = async (): Promise<BankAccount[]> => {
  const response = await api.get<BankAccount[]>("/bank-accounts");
  return response.data;
};

export const createAccount = async (
  data: CreateAccountDTO
): Promise<BankAccount> => {
  const response = await api.post<BankAccount>("/bank-accounts", data);
  return response.data;
};
