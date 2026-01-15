import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { type CreateCardDTO } from "../services/api";

const schema = z.object({
  title: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().min(1, "Bandeira é obrigatória"),
  limit: z.coerce.number().min(0, "Limite inválido"),
});

type FormData = z.infer<typeof schema>;

interface CardFormProps {
  onSubmit: (data: CreateCardDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CardForm = ({ onSubmit, onCancel, isLoading }: CardFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      brand: "Mastercard", // Default
      limit: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Apelido do Cartão"
        placeholder="Ex: Nubank Roxinho, XP Visa..."
        {...register("title")}
        error={errors.title?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bandeira
        </label>
        <select
          {...register("brand")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
        >
          <option value="Mastercard">Mastercard</option>
          <option value="Visa">Visa</option>
          <option value="Elo">Elo</option>
          <option value="Amex">American Express</option>
          <option value="Hipercard">Hipercard</option>
          <option value="Outros">Outros</option>
        </select>
        {errors.brand && (
          <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>
        )}
      </div>

      <Input
        label="Limite Total (R$)"
        type="number"
        step="0.01"
        placeholder="0,00"
        {...register("limit")}
        error={errors.limit?.message}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar Cartão
        </Button>
      </div>
    </form>
  );
};
