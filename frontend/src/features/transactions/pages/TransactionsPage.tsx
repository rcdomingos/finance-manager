import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { TransactionForm } from "../components/TransactionForm";
import { useCreateTransaction } from "../hooks/useTransactions";

export const TransactionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
          <p className="text-gray-500">Gerencie suas receitas e despesas.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Lançamento
        </Button>
      </div>

      <div className="bg-white p-12 text-center rounded-lg border border-gray-200 border-dashed">
        <p className="text-gray-500">
          A lista de transações será implementada a seguir.
        </p>
        <p className="text-sm text-gray-400">
          Teste o botão "Novo Lançamento" acima.
        </p>
      </div>

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
