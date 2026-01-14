import { useState } from "react";
import { Plus } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { CategoryCard } from "../components/CategoryCard";
import type { Category, TransactionType } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useCreateCategory } from "../hooks/useCreateCategory";
import { CategoryForm } from "../components/CategoryForm";

export const CategoriesPage = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createMutation = useCreateCategory();

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false); // Fecha o modal
      },
    });
  };

  const getCategoriesByType = (type: TransactionType) => {
    return categories?.filter((c) => c.type === type) || [];
  };

  const incomes = getCategoriesByType("INCOME");
  const expenses = getCategoriesByType("EXPENSE");
  const transfers = getCategoriesByType("TRANSFER");

  const CategorySection = ({
    title,
    data,
    colorClass,
  }: {
    title: string;
    data: Category[];
    colorClass: string;
  }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <h2
          className={`text-lg font-bold mb-4 flex items-center gap-2 ${colorClass}`}
        >
          {title}
          <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {data.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((category) => (
            <div key={category.id} className="group h-full">
              <CategoryCard
                category={category}
                onEdit={(cat) => console.log("Editar", cat.name)}
                onDelete={(id) => console.log("Deletar", id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        Erro ao carregar categorias. Verifique se o backend está rodando.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Conteúdo: Seções por Tipo */}
      <div className="space-y-8">
        <CategorySection
          title="Receitas"
          data={incomes}
          colorClass="text-green-700"
        />
        <CategorySection
          title="Despesas"
          data={expenses}
          colorClass="text-red-700"
        />
        <CategorySection
          title="Transferências"
          data={transfers}
          colorClass="text-blue-700"
        />

        {categories?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
          </div>
        )}
      </div>
      {/* Modal: Nova Categoria */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Categoria"
        description="Crie uma categoria principal e adicione suas subcategorias."
      >
        <CategoryForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};
