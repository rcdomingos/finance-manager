import { CreditCard as CardIcon, CalendarClock } from "lucide-react";
import { type CreditCard } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import clsx from "clsx";

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
      className={clsx(
        "relative h-52 rounded-xl p-6 text-white shadow-lg overflow-hidden group transition-transform hover:-translate-y-1",
        card.isActive
          ? `bg-gradient-to-br ${getGradient(card.brand)}`
          : "bg-gray-800"
      )}
    >
      {!card.isActive && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold border border-white/30">
            INATIVO
          </span>
        </div>
      )}

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
          <p className="font-semibold text-lg tracking-wide">{card.title}</p>
          <div className="flex items-center gap-4 mt-2 text-xs opacity-80">
            <div className="flex items-center gap-1">
              <CalendarClock size={12} />
              <span>Fecha dia {card.closingDate}</span>
            </div>
            <span>|</span>
            <div>Vence dia {card.dueDate}</div>
          </div>
        </div>

        <div>
          <p className="text-xs opacity-70">Limite Total</p>
          <p className="font-bold text-xl">{formatCurrency(card.limit)}</p>
        </div>
      </div>
    </div>
  );
};
