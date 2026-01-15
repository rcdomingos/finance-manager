import { useState } from "react";
import { Plus } from "lucide-react";
import { useCards, useCreateCard } from "../hooks/useCards";
import { CreditCardItem } from "../components/CreditCardItem";
import { CardForm } from "../components/CardForm";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";

export const CardsPage = () => {
  const { data: cards, isLoading, isError } = useCards();
  const createMutation = useCreateCard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  if (isLoading) return <div>Carregando cartões...</div>;
  if (isError) return <div>Erro ao carregar cartões.</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Cartões</h1>
          <p className="text-gray-500 mt-1">
            Gerencie seus limites e cartões de crédito
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Cartão
        </Button>
      </div>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards?.map((card) => (
          <CreditCardItem key={card.id} card={card} />
        ))}

        {cards?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum cartão cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Cartão de Crédito"
        description="Cadastre seu cartão para controlar as faturas."
      >
        <CardForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};
