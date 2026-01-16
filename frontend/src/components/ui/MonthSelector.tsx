import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface MonthSelectorProps {
  currentMonth: number; // 1 a 12
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const MonthSelector = ({
  currentMonth,
  currentYear,
  onMonthChange,
}: MonthSelectorProps) => {
  const handlePrev = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  // Formata o nome do mês (Ex: "Janeiro de 2026")
  const dateLabel = new Date(currentYear, currentMonth - 1).toLocaleString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
      <Button variant="ghost" size="sm" onClick={handlePrev}>
        <ChevronLeft size={20} />
      </Button>

      <span className="font-semibold text-gray-800  min-w-[140px] text-center">
        {dateLabel}
      </span>

      <Button variant="ghost" size="sm" onClick={handleNext}>
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
