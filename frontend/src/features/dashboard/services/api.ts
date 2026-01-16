import { api } from "../../../services/api";

export interface DashboardSummary {
  currentBalance: number;
  monthIncome: number;
  monthExpense: number;
  chartData: { name: string; value: number }[];
}

export const getDashboardSummary = async (month: number, year: number) => {
  const response = await api.get<DashboardSummary>("/dashboard/summary", {
    params: { month, year },
  });
  return response.data;
};
