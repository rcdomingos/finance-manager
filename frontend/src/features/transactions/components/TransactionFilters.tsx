import { X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useCategories } from '../../categories/hooks/useCategories';

interface FilterState {
  type?: string;
  categoryId?: string;
  paymentMethod?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

export const TransactionFilters = ({ isOpen, onClose, filters, onFilterChange }: Props) => {
  const { data: categories } = useCategories();

  const handleChange = (key: keyof FilterState, value: string | undefined) => {
    onFilterChange({ ...filters, [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in zoom-in-95 absolute right-0 top-12 z-20 w-80 rounded-xl border border-gray-100 bg-white p-4 shadow-xl duration-200">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="font-semibold text-gray-700">Filtrar Lançamentos</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Filtro de Tipo */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Tipo</label>
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { label: 'Todos', value: undefined },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleChange('type', opt.value)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                  filters.type === opt.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Categoria */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
            Categoria
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.categoryId || ''}
            onChange={(e) => handleChange('categoryId', e.target.value || undefined)}
          >
            <option value="">Todas as categorias</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Pagamento */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
            Forma de Pagamento
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.paymentMethod || ''}
            onChange={(e) => handleChange('paymentMethod', e.target.value || undefined)}
          >
            <option value="">Todos</option>
            <option value="CREDIT_CARD">Cartão de Crédito</option>
            <option value="BANK_ACCOUNT">Conta / Dinheiro</option>
          </select>
        </div>

        {/* Ações */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={() => onFilterChange({})} // Limpa tudo
          >
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
