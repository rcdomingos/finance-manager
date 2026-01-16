import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

import { MonthSelector } from "../components/ui/MonthSelector";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../features/dashboard/hooks/useDashboard";
import { StatCard } from "../features/dashboard/components/StatCard";
import { ExpenseChart } from "../features/dashboard/components/ExpenseChart";

export const Dashboard = () => {
  const { user } = useAuth();

  // Controle de Data
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const { data: summary, isLoading } = useDashboard(month, year);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.name} 👋
          </h1>
          <p className="text-gray-500">Aqui está o resumo financeiro.</p>
        </div>

        <MonthSelector
          currentMonth={month}
          currentYear={year}
          onMonthChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Atual (Não depende do mês, mas mostramos sempre) */}
        <StatCard
          title="Saldo Atual Total"
          value={summary?.currentBalance || 0}
          icon={Wallet}
          isLoading={isLoading}
        />

        <StatCard
          title="Receitas no Mês"
          value={summary?.monthIncome || 0}
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
        />

        <StatCard
          title="Despesas no Mês"
          value={summary?.monthExpense || 0}
          icon={TrendingDown}
          variant="danger"
          isLoading={isLoading}
        />
      </div>

      {/* Área Principal: Gráfico e (Futuramente) Últimas Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Despesas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Despesas por Categoria
          </h3>
          <ExpenseChart data={summary?.chartData || []} />
        </div>

        {/* Placeholder para Dicas */}
        <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg flex flex-col justify-center items-start">
          <h3 className="text-xl font-bold mb-2">Dica Financeira 💡</h3>
          <p className="opacity-90 mb-6">
            Tente manter as suas despesas essenciais abaixo de 50% da sua renda
            mensal.
          </p>
          <div className="w-full bg-white/20 h-1 rounded mb-2">
            <div className="bg-white h-1 rounded w-[70%]"></div>
          </div>
          <p className="text-xs opacity-75">
            Meta de economia mensal (Exemplo)
          </p>
        </div>
      </div>
    </div>
  );
};
