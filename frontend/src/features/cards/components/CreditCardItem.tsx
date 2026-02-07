import { CreditCard as CardIcon, CalendarClock } from "lucide-react";
import { type CreditCard } from "../../../types";
import { formatCurrency } from "../../../utils/formatCurrency";
import clsx from "clsx";

interface CreditCardItemProps {
  card: CreditCard;
}

export const CreditCardItem = ({ card }: CreditCardItemProps) => {
  const getCardStyle = (issuer?: string, brand?: string) => {
    const i = issuer?.toLowerCase() || "";
    // Temas específicos por Emissor
    if (i.includes("rico")) return { bg: "bg-[#2E3B78]", text: "text-[#F64F00]" };
    if (i.includes("nubank")) return { bg: "bg-[#803EB3]", text: "text-white" };
    if (i.includes("itau")) return { bg: "bg-[#F75000]", text: "text-white" };
    if (i.includes("mercado pago")) return { bg: "bg-[#0D151C]", text: "text-white" };

    // Fallback: Cores por Bandeira (se for "Outros" ou undefined)
    const b = brand?.toLowerCase() || "";
    if (b.includes("master")) return { bg: "bg-gradient-to-br from-orange-700 to-red-900", text: "text-white" };
    if (b.includes("visa")) return { bg: "bg-gradient-to-br from-blue-700 to-blue-900", text: "text-white" };
    
    // Default genérico
    return { bg: "bg-gradient-to-br from-gray-700 to-gray-900", text: "text-white" };
  };

  const style = getCardStyle(card.issuer, card.brand);

  return (
    <div
      className={clsx(
        "relative h-52 rounded-xl p-6 shadow-lg overflow-hidden group transition-transform hover:-translate-y-1",
        card.isActive ? style.bg : "bg-gray-800",
        style.text
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
