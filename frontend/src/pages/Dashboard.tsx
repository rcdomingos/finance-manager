import { useCategories } from "../features/categories/hooks/useCategories";

export const Dashboard = () => {
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) return <div className="p-8">Carregando categorias...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">
        Erro ao carregar dados. O backend está rodando?
      </div>
    );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Meu Financeiro</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          Categorias Carregadas do Banco
        </h2>
        <ul className="space-y-2">
          {categories?.map((cat) => (
            <li key={cat.id} className="border-b pb-2 last:border-0">
              <span className="font-bold text-gray-700">{cat.name}</span>
              <span className="text-xs ml-2 px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                {cat.type}
              </span>

              {/* Lista de Subcategorias */}
              <div className="ml-4 mt-1 text-sm text-gray-500">
                {cat.subCategories?.length > 0
                  ? cat.subCategories.map((sub) => sub.name).join(", ")
                  : "Sem subcategorias"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
