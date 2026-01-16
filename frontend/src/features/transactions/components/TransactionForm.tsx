import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { type CreateTransactionDTO } from "../services/api";

// Hooks de Dados auxiliares
import { useCategories } from "../../categories/hooks/useCategories";
import { useAccounts } from "../../accounts/hooks/useAccounts";
import { useCards } from "../../cards/hooks/useCards";

// Schema Frontend
const schema = z
  .object({
    description: z.string().min(1, "Descrição obrigatória"),
    amount: z.coerce.number().min(0.01, "Valor inválido"),
    date: z.string(), // Input type="date" retorna string YYYY-MM-DD
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),

    categoryId: z.string().min(1, "Selecione a categoria"),
    subCategoryId: z.string().min(1, "Selecione a subcategoria"),

    paymentMethod: z.enum(["BANK_ACCOUNT", "CREDIT_CARD"]),
    bankAccountId: z.string().optional(),
    creditCardId: z.string().optional(),
    installments: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "BANK_ACCOUNT" && !data.bankAccountId)
        return false;
      if (data.paymentMethod === "CREDIT_CARD" && !data.creditCardId)
        return false;
      return true;
    },
    { message: "Selecione a conta/cartão", path: ["paymentMethod"] }
  );

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: CreateTransactionDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TransactionForm = ({ onSubmit, onCancel, isLoading }: Props) => {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: cards } = useCards();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: "EXPENSE",
      paymentMethod: "BANK_ACCOUNT",
      date: new Date().toISOString().split("T")[0], // Hoje
    },
  });

  const [isInstallment, setIsInstallment] = useState(false);

  // --- LÓGICA CONDICIONAL (WATCHERS) ---
  const selectedType = useWatch({ control, name: "type" });
  const selectedCategory = useWatch({ control, name: "categoryId" });
  const selectedPaymentMethod = useWatch({ control, name: "paymentMethod" });

  // 1. Filtrar Categorias pelo Tipo (Receita vs Despesa)
  const filteredCategories =
    categories?.filter((c) => c.type === selectedType) || [];

  // 2. Filtrar Subcategorias pela Categoria selecionada
  const activeCategory = categories?.find((c) => c.id === selectedCategory);
  const filteredSubCategories = activeCategory?.subCategories || [];

  // 3. Efeito: Se mudar o Tipo, reseta a categoria selecionada para evitar inconsistência
  useEffect(() => {
    setValue("categoryId", "");
    setValue("subCategoryId", "");

    // Regra de Negócio: Se for Receita, força ser Conta Bancária
    if (selectedType === "INCOME") {
      setValue("paymentMethod", "BANK_ACCOUNT");
    }
  }, [selectedType, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
        {["EXPENSE", "INCOME", "TRANSFER"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setValue("type", type as any)}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              selectedType === type
                ? type === "EXPENSE"
                  ? "bg-red-100 text-red-700 shadow-sm"
                  : type === "INCOME"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "bg-blue-100 text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {type === "EXPENSE"
              ? "Despesa"
              : type === "INCOME"
              ? "Receita"
              : "Transferência"}
          </button>
        ))}
      </div>

      {/* Descrição e Valor */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Descrição"
          placeholder="Ex: Mercado, Salário..."
          {...register("description")}
          error={errors.description?.message}
        />
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          {...register("amount")}
          error={errors.amount?.message}
        />
      </div>

      {/* Data e Categorias */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Data"
          type="date"
          {...register("date")}
          error={errors.date?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            {...register("categoryId")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategoria
          </label>
          <select
            {...register("subCategoryId")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            disabled={!selectedCategory}
          >
            <option value="">Selecione...</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {errors.subCategoryId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.subCategoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 my-4"></div>

      {/* Condição de Pagamento - Só mostra opção de parcelar se for Despesa e Cartão */}
      {selectedType === "EXPENSE" &&
        selectedPaymentMethod === "CREDIT_CARD" && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
            <p className="text-sm font-medium text-orange-800 mb-2">
              Condição de Pagamento
            </p>
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-md border border-orange-200 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsInstallment(false);
                    setValue("installments", 1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    !isInstallment
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  À vista
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstallment(true)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    isInstallment
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  Parcelado
                </button>
              </div>

              {/* Input de Parcelas (Só aparece se Parcelado for true) */}
              {isInstallment && (
                <div className="flex-1 animate-in fade-in slide-in-from-left-2">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    min="2"
                    max="99"
                    {...register("installments")}
                    className="bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

      {/* Seção de Pagamento */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Detalhes do Pagamento
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Método de Pagamento - Desabilitado se for Receita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <select
              {...register("paymentMethod")}
              disabled={selectedType === "INCOME"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="BANK_ACCOUNT">Conta / Dinheiro</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
            </select>
          </div>

          {/* Seleção Dinâmica: Ou Conta ou Cartão */}
          {selectedPaymentMethod === "BANK_ACCOUNT" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedType === "INCOME"
                  ? "Receber na Conta"
                  : "Debitar da Conta"}
              </label>
              <select
                {...register("bankAccountId")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione a conta...</option>
                {accounts?.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} (Saldo: R$ {acc.currentBalance})
                  </option>
                ))}
              </select>
              {errors.paymentMethod && !errors.bankAccountId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecione o Cartão
              </label>
              <select
                {...register("creditCardId")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione o cartão...</option>
                {cards?.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.title} - {card.brand}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && !errors.creditCardId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar Lançamento
        </Button>
      </div>
    </form>
  );
};
