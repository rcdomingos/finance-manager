import { useState } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  Landmark,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { type Transaction } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useDeleteTransaction } from "../hooks/useTransactions";

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionDetailsModal = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
}: Props) => {
  const deleteMutation = useDeleteTransaction();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transaction) return null;

  const handleDelete = async () => {
    // TODO: Melhorar confirmação (ex: modal de confirmação)
    if (
      confirm(
        "Tem certeza? Se for uma despesa paga, o valor voltará para a conta."
      )
    ) {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(transaction.id).catch((error) => {
        //TODO: Tratar erro (ex: toast de erro)
        console.error("Erro ao excluir transação:", error);
      });
      setIsDeleting(false);
      onClose();
    }
  };

  const formattedDate = new Date(transaction.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Lançamento">
      <div className="space-y-6">
        {/* Cabeçalho de Valor */}
        <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">
            {transaction.type === "EXPENSE" ? "Valor Pago" : "Valor Recebido"}
          </p>
          <h2
            className={`text-3xl font-bold ${
              transaction.type === "EXPENSE" ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(transaction.amount)}
          </h2>
          <p className="text-gray-700 font-medium mt-2">
            {transaction.description}
          </p>
        </div>

        {/* Detalhes em Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={14} /> <span>Data</span>
            </div>
            <p className="font-medium">{formattedDate}</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Tag size={14} /> <span>Categoria</span>
            </div>
            <p className="font-medium">{transaction.category.name}</p>
            <p className="text-xs text-gray-500">
              {transaction.subCategory?.name}
            </p>
          </div>

          <div className="col-span-2 p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              {transaction.paymentMethod === "CREDIT_CARD" ? (
                <CreditCard size={14} />
              ) : (
                <Landmark size={14} />
              )}
              <span>
                {transaction.paymentMethod === "CREDIT_CARD"
                  ? "Cartão de Crédito"
                  : "Conta Bancária"}
              </span>
            </div>
            <p className="font-medium">
              {transaction.paymentMethod === "CREDIT_CARD"
                ? transaction.creditCard?.title
                : transaction.bankAccount?.bankName}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 size={16} className="mr-2" /> Excluir
          </Button>

          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              onClose(); // Fecha detalhe
              onEdit(transaction); // Abre form de edição
            }}
          >
            <Pencil size={16} className="mr-2" /> Editar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
