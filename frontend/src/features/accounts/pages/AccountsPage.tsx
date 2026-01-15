import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccounts, useCreateAccount } from "../hooks/useAccounts";
import { AccountCard } from "../components/AccountCard";
import { AccountForm } from "../components/AccountForm";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";

export const AccountsPage = () => {
  const { data: accounts, isLoading, isError } = useAccounts();
  const createMutation = useCreateAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  if (isLoading) return <div>Carregando contas...</div>;
  if (isError) return <div>Erro ao carregar contas.</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie seus saldos e contas bancárias
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Grid de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}

        {accounts?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhuma conta cadastrada.</p>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Conta Bancária"
        description="Cadastre uma conta corrente ou carteira."
      >
        <AccountForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};
