import { type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "../../../utils/formatCurrency";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger";
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = "default",
  isLoading,
}: StatCardProps) => {
  const styles = {
    default: "bg-white text-gray-900",
    success: "bg-white text-green-700",
    danger: "bg-white text-red-700",
  };

  const iconStyles = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div
      className={clsx(
        "p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4",
        styles[variant]
      )}
    >
      <div className={clsx("p-3 rounded-lg", iconStyles[variant])}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-7 w-32 bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <h3 className="text-2xl font-bold">{formatCurrency(value)}</h3>
        )}
      </div>
    </div>
  );
};
