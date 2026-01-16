import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../services/api";

export const useDashboard = (month: number, year: number) => {
  return useQuery({
    queryKey: ["dashboard-summary", month, year],
    queryFn: () => getDashboardSummary(month, year),
    staleTime: 1000 * 60 * 5, // Cache de 5 min
  });
};
