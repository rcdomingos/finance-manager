import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { type CreateCategoryDTO } from "../services/api";

const schema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  subCategories: z.array(
    z.object({
      name: z.string().min(2, "Mínimo 2 caracteres"),
    })
  ),
});

// Inferir o tipo do formulário a partir do schema
type FormData = z.infer<typeof schema>;

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm = ({
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
      subCategories: [],
    },
  });

  // Hook para gerenciar array dinâmico
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subCategories",
  });

  const handleFormSubmit = (data: FormData) => {
    // Transforma o array de objetos {name: "X"} em array de strings ["X"] para a API
    const formattedData: CreateCategoryDTO = {
      ...data,
      subCategories: data.subCategories.map((sub) => sub.name),
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome e Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome da Categoria"
          placeholder="Ex: Lazer"
          {...register("name")}
          error={errors.name?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            {...register("type")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
            <option value="TRANSFER">Transferência</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Subcategorias Dinâmicas */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Subcategorias
          </label>
          <button
            type="button"
            onClick={() => append({ name: "" })}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center font-medium"
          >
            <Plus size={14} className="mr-1" /> Adicionar
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1"
            >
              <Input
                placeholder="Ex: Cinema, Viagem..."
                {...register(`subCategories.${index}.name` as const)}
                error={errors.subCategories?.[index]?.name?.message}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Remover subcategoria"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
              Nenhuma subcategoria adicionada.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar Categoria
        </Button>
      </div>
    </form>
  );
};
