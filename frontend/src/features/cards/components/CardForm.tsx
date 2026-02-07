import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { type CreateCardDTO } from "../services/api";

const schema = z.object({
  title: z.string().min(1, "Nome é obrigatório"),
  brand: z.string().min(1, "Bandeira é obrigatória"),
  issuer: z.string().min(1, "Emissor é obrigatório"),
  limit: z.coerce.number().min(0, "Limite inválido"),
  // Validação dos dias
  closingDate: z.coerce.number().min(1).max(31, "Dia inválido"),
  dueDate: z.coerce.number().min(1).max(31, "Dia inválido"),
  isActive: z.boolean(),
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
      issuer: "Outros", // Default
      limit: 0,
      closingDate: 1, // Padrão dia 1
      dueDate: 10, // Padrão dia 10
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nome e Status */}
      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <Input
            label="Apelido do Cartão"
            placeholder="Ex: Nubank Roxinho"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* Checkbox estilizado simples */}
        <div className="mt-8 flex items-center">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            Cartão Ativo
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            <option value="Amex">Amex</option>
            <option value="Outros">Outros</option>
          </select>
        </div>



        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Emissor
           </label>
           <select
             {...register("issuer")}
             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
           >
             <option value="Mercado Pago">Mercado Pago</option>
             <option value="Rico">Rico</option>
             <option value="Nubank">Nubank</option>
             <option value="Itau">Itaú</option>
             <option value="Outros">Outros</option>
           </select>
        </div>

        <div className="col-span-2">
          <Input
            label="Limite Total (R$)"
            type="number"
            step="0.01"
            {...register("limit")}
            error={errors.limit?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <Input
          label="Dia do Fechamento"
          type="number"
          min="1"
          max="31"
          placeholder="Dia"
          {...register("closingDate")}
          error={errors.closingDate?.message}
        />
        <Input
          label="Dia do Vencimento"
          type="number"
          min="1"
          max="31"
          placeholder="Dia"
          {...register("dueDate")}
          error={errors.dueDate?.message}
        />
        <p className="col-span-2 text-xs text-blue-600">
          * Usado para calcular em qual fatura a despesa cairá.
        </p>
      </div>

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
