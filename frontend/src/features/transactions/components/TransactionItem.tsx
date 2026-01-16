import clsx from "clsx";
import { type Transaction } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";

interface TransactionItemProps {
  transaction: Transaction;
  onClick: () => void;
}

export const TransactionItem = ({
  transaction,
  onClick,
}: TransactionItemProps) => {
  const isExpense = transaction.type === "EXPENSE";

  // Formata dia (ex: 15 JAN)
  const dateObj = new Date(transaction.date);
  const day = dateObj.getUTCDate().toString().padStart(2, "0");
  const month = dateObj
    .toLocaleString("pt-BR", { month: "short", timeZone: "UTC" })
    .toUpperCase()
    .replace(".", "");

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all mb-3"
    >
      <div className="flex items-center gap-4">
        {/* Data Box */}
        <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-lg text-gray-500 font-medium">
          <span className="text-sm font-bold text-gray-800">{day}</span>
          <span className="text-[10px]">{month}</span>
        </div>

        {/* Info Principal */}
        <div>
          <h3 className="font-semibold text-gray-800">
            {transaction.description}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
              {transaction.category?.name || "Sem categoria"}
            </span>
            <span>•</span>
            <span>
              {transaction.paymentMethod === "CREDIT_CARD"
                ? `Cartão ${transaction.creditCard?.title}`
                : transaction.bankAccount?.bankName}
            </span>
          </div>
        </div>
      </div>

      {/* Valor */}
      <div className="text-right">
        <span
          className={clsx(
            "font-bold text-lg block",
            isExpense ? "text-red-600" : "text-green-600"
          )}
        >
          {isExpense ? "- " : "+ "}
          {formatCurrency(transaction.amount)}
        </span>

        {/* Status (TODO: futuro: Pendente/Pago) */}
        {transaction.paymentMethod === "CREDIT_CARD" && (
          <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-1.5 py-0.5 rounded">
            Crédito
          </span>
        )}
      </div>
    </div>
  );
};
