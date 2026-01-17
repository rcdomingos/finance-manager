import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { type CreateTransactionDTO } from '../services/api';
import { type Transaction } from '../../../types';

// Hooks de Dados auxiliares
import { useCategories } from '../../categories/hooks/useCategories';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useCards } from '../../cards/hooks/useCards';

// Schema Frontend
const schema = z
  .object({
    description: z.string().min(1, 'Descrição obrigatória'),
    amount: z.coerce.number().min(0.01, 'Valor inválido'),
    date: z.string(), // Input type="date" retorna string YYYY-MM-DD
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),

    categoryId: z.string().min(1, 'Selecione a categoria'),
    subCategoryId: z.string().min(1, 'Selecione a subcategoria'),

    paymentMethod: z.enum(['BANK_ACCOUNT', 'CREDIT_CARD']),
    bankAccountId: z.string().optional(),
    creditCardId: z.string().optional(),
    installments: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'BANK_ACCOUNT' && !data.bankAccountId) return false;
      if (data.paymentMethod === 'CREDIT_CARD' && !data.creditCardId) return false;
      return true;
    },
    { message: 'Selecione a conta/cartão', path: ['paymentMethod'] },
  );

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: CreateTransactionDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Transaction | null;
}

export const TransactionForm = ({ onSubmit, onCancel, isLoading, initialData }: Props) => {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: cards } = useCards();

  // Calcula os valores iniciais (Memoizado para não recriar a cada render)
  const defaultValues = useMemo(() => {
    if (!initialData) {
      return {
        type: 'EXPENSE',
        paymentMethod: 'BANK_ACCOUNT',
        date: new Date().toISOString().split('T')[0],
      };
    }

    const dateStr = new Date(initialData.date).toISOString().split('T')[0];

    return {
      description: initialData.description,
      amount: initialData.amount,
      date: dateStr,
      type: initialData.type,
      categoryId: initialData.category.id,
      subCategoryId: initialData.subCategory.id,
      paymentMethod: initialData.paymentMethod,
      bankAccountId: initialData.bankAccount?.id,
      creditCardId: initialData.creditCard?.id,
    } as any;
  }, [initialData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const [isInstallment, setIsInstallment] = useState(false);

  // --- LÓGICA CONDICIONAL (WATCHERS) ---
  const selectedType = useWatch({ control, name: 'type' });
  const selectedCategory = useWatch({ control, name: 'categoryId' });
  const selectedPaymentMethod = useWatch({ control, name: 'paymentMethod' });

  // Filtrar Categorias pelo Tipo (Receita vs Despesa)
  const filteredCategories = categories?.filter((c) => c.type === selectedType) || [];

  // Filtrar Subcategorias pela Categoria selecionada
  const activeCategory = categories?.find((c) => c.id === selectedCategory);
  const filteredSubCategories = activeCategory?.subCategories || [];

  // Efeito: Se mudar o Tipo, reseta a categoria selecionada para evitar inconsistência
  useEffect(() => {
    if (!initialData) {
      setValue('categoryId', '');
      setValue('subCategoryId', '');

      // Regra de Negócio: Se for Receita, força ser Conta Bancária
      if (selectedType === 'INCOME') {
        setValue('paymentMethod', 'BANK_ACCOUNT');
      }
    }
  }, [selectedType, setValue, initialData]);

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div
        className={`grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1 ${
          isEditing ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {['EXPENSE', 'INCOME', 'TRANSFER'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setValue('type', type as any)}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              selectedType === type
                ? type === 'EXPENSE'
                  ? 'bg-red-100 text-red-700 shadow-sm'
                  : type === 'INCOME'
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'EXPENSE' ? 'Despesa' : type === 'INCOME' ? 'Receita' : 'Transferência'}
          </button>
        ))}
      </div>

      {/* Descrição e Valor */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Descrição"
          placeholder="Ex: Mercado, Salário..."
          {...register('description')}
          error={errors.description?.message}
        />
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          {...register('amount')}
          error={errors.amount?.message}
        />
      </div>

      {/* Data e Categorias */}
      <div className="grid grid-cols-3 gap-4">
        <Input label="Data" type="date" {...register('date')} error={errors.date?.message} />

        <div className="col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
          <select
            {...register('categoryId')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {/* Se estiver editando, mostra a categoria atual mesmo que não esteja na lista filtrada (fallback) */}
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Subcategoria</label>
          <select
            {...register('subCategoryId')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subCategoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.subCategoryId.message}</p>
          )}
        </div>
      </div>

      <div className="my-4 border-t border-gray-100"></div>

      {/* Seção de Pagamento */}
      {isEditing ? (
        <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 text-xs text-yellow-800">
          <span className="font-bold">Nota:</span> Para alterar a forma de pagamento (Conta/Cartão),
          exclua este lançamento e crie um novo.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {selectedType === 'EXPENSE' && selectedPaymentMethod === 'CREDIT_CARD' && (
            <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="mb-2 text-sm font-medium text-orange-800">Condição de Pagamento</p>
              <div className="flex items-center gap-4">
                <div className="flex rounded-md border border-orange-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInstallment(false);
                      setValue('installments', 1);
                    }}
                    className={`rounded px-3 py-1.5 text-sm transition-colors ${
                      !isInstallment ? 'bg-orange-100 font-medium text-orange-700' : 'text-gray-600'
                    }`}
                  >
                    À vista
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInstallment(true)}
                    className={`rounded px-3 py-1.5 text-sm transition-colors ${
                      isInstallment ? 'bg-orange-100 font-medium text-orange-700' : 'text-gray-600'
                    }`}
                  >
                    Parcelado
                  </button>
                </div>

                {/* Input de Parcelas (Só aparece se Parcelado for true) */}
                {isInstallment && (
                  <div className="animate-in fade-in slide-in-from-left-2 flex-1">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      min="2"
                      max="99"
                      {...register('installments')}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Forma de Pagamento
              </label>
              <select
                {...register('paymentMethod')}
                disabled={selectedType === 'INCOME'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="BANK_ACCOUNT">Conta / Dinheiro</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
              </select>
            </div>

            {selectedPaymentMethod === 'BANK_ACCOUNT' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {selectedType === 'INCOME' ? 'Receber na Conta' : 'Debitar da Conta'}
                </label>
                <select
                  {...register('bankAccountId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecione a conta...</option>
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} (R$ {acc.currentBalance})
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && !errors.bankAccountId && (
                  <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Selecione o Cartão
                </label>
                <select
                  {...register('creditCardId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecione o cartão...</option>
                  {cards?.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.title}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && !errors.creditCardId && (
                  <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
        </Button>
      </div>
    </form>
  );
};
