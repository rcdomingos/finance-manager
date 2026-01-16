import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { MonthSelector } from "../../../components/ui/MonthSelector";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionItem } from "../components/TransactionItem";
import {
  useTransactions,
  useCreateTransaction,
} from "../hooks/useTransactions";

export const TransactionsPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: transactions,
    isLoading,
    isError,
  } = useTransactions(month, year);
  const createMutation = useCreateTransaction();

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        //TODO: Toast de sucesso
      },
    });
  };

  return (
    <div>
      {/* Header com Navegação de Data */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Navegador de Mês */}
          <div className="flex-1 md:flex-none">
            <MonthSelector
              currentMonth={month}
              currentYear={year}
              onMonthChange={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
          </div>

          <Button variant="outline" className="hidden sm:flex">
            <Filter size={18} className="mr-2" />
            Filtrar
          </Button>

          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Novo
          </Button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-10">Carregando lançamentos...</div>
        )}

        {isError && (
          <div className="text-center text-red-500 py-10">
            Erro ao carregar dados.
          </div>
        )}

        {!isLoading && transactions?.length === 0 && (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200 border-dashed">
            <p className="text-gray-500 mb-2">Nenhum lançamento neste mês.</p>
            <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
              Criar o primeiro
            </Button>
          </div>
        )}

        {/* Mapeamento dos itens */}
        {transactions?.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento"
        description="Adicione uma despesa, receita ou transferência."
      >
        <TransactionForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};
