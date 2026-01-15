import { CreditCard as CardIcon } from "lucide-react";
import { type CreditCard } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";

interface CreditCardItemProps {
  card: CreditCard;
}

export const CreditCardItem = ({ card }: CreditCardItemProps) => {
  const getGradient = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes("master")) return "from-orange-700 to-red-900";
    if (b.includes("visa")) return "from-blue-700 to-blue-900";
    if (b.includes("nubank")) return "from-purple-700 to-purple-900";
    return "from-gray-700 to-gray-900";
  };

  return (
    <div
      className={`relative h-48 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br ${getGradient(
        card.brand
      )} overflow-hidden group transition-transform hover:-translate-y-1`}
    >
      <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
        <CardIcon size={150} />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="w-12 h-8 bg-yellow-200/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <div className="w-8 h-5 border border-white/30 rounded sm:w-8 sm:h-5"></div>
          </div>
          <span className="font-bold tracking-wider uppercase opacity-80">
            {card.brand}
          </span>
        </div>
        <div>
          <p className="text-xs opacity-70 mb-1">Nome do Cartão</p>
          <p className="font-semibold text-lg tracking-wide">{card.title}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">Limite Total</p>
            <p className="font-bold text-xl">{formatCurrency(card.limit)}</p>
          </div>
          {/* Fatura atual (Placeholder para o futuro) */}
          {/* <div className="text-right">
             <p className="text-xs opacity-70">Fatura Atual</p>
             <p className="font-bold text-sm">R$ 0,00</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};
