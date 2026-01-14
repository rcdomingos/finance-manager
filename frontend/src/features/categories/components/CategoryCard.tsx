import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Category } from "../../../types";

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) => {
  const typeColors = {
    INCOME: "text-green-600 bg-green-50 border-green-200",
    EXPENSE: "text-red-600 bg-red-50 border-red-200",
    TRANSFER: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const typeLabels = {
    INCOME: "Receita",
    EXPENSE: "Despesa",
    TRANSFER: "Transferência",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{category.name}</h3>
          <span
            className={clsx(
              "text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block",
              typeColors[category.type]
            )}
          >
            {typeLabels[category.type]}
          </span>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(category)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete?.(category.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Corpo com Subcategorias */}
      <div className="p-4 flex-1 bg-gray-50/50">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
          Subcategorias
        </p>

        {category.subCategories && category.subCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {category.subCategories.map((sub) => (
              <span
                key={sub.id}
                className="text-xs px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md shadow-sm"
              >
                {sub.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Nenhuma subcategoria</p>
        )}
      </div>
    </div>
  );
};
