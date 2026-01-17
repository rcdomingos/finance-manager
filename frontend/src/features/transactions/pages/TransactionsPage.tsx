import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MonthSelector } from '../../../components/ui/MonthSelector';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionItem } from '../components/TransactionItem';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import type { Transaction } from '../../../types';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';

export const TransactionsPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: transactions, isLoading, isError } = useTransactions(month, year);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const handleFormSubmit = (data: any) => {
    if (selectedTransaction) {
      // MODO EDIÇÃO
      updateMutation.mutate(
        { id: selectedTransaction.id, data },
        {
          onSuccess: () => {
            setIsFormModalOpen(false);
            setSelectedTransaction(null);
          },
        },
      );
    } else {
      // MODO CRIAÇÃO
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormModalOpen(false);
        },
      });
    }
  };

  const handleOpenNew = () => {
    setSelectedTransaction(null);
    setIsFormModalOpen(true);
  };

  return (
    <div>
      {/* Header com Navegação de Data */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
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

          <Button onClick={handleOpenNew}>
            <Plus size={20} className="mr-2" /> Novo
          </Button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {isLoading && <div className="py-10 text-center">Carregando lançamentos...</div>}

        {isError && <div className="py-10 text-center text-red-500">Erro ao carregar dados.</div>}

        {!isLoading && transactions?.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="mb-2 text-gray-500">Nenhum lançamento neste mês.</p>
            <Button variant="ghost" onClick={() => setIsFormModalOpen(true)}>
              Criar o primeiro
            </Button>
          </div>
        )}

        {/* Lista */}
        {transactions?.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            onClick={() => {
              setSelectedTransaction(t);
              setIsDetailsOpen(true);
            }}
          />
        ))}
      </div>

      {/* Modal de Detalhes (Comprovante) */}
      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTransaction}
        onEdit={(transaction) => {
          setIsDetailsOpen(false);
          setSelectedTransaction(transaction);
          setIsFormModalOpen(true);
        }}
      />

      {/* Modal de Formulário (Criação E Edição) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedTransaction(null); // Limpa ao fechar
        }}
        title={selectedTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
        description={
          selectedTransaction
            ? 'Altere os detalhes do registro.'
            : 'Adicione uma nova movimentação.'
        }
      >
        <TransactionForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormModalOpen(false);
            setSelectedTransaction(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={selectedTransaction} // Passa os dados se existirem
        />
      </Modal>
    </div>
  );
};
