import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { type CreateAccountDTO } from "../services/api";

const schema = z.object({
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  // O input type="number" retorna string, precisamos transformar
  initialBalance: z.coerce.number({
    invalid_type_error: "Insira um valor válido",
  }),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface AccountFormProps {
  onSubmit: (data: CreateAccountDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AccountForm = ({
  onSubmit,
  onCancel,
  isLoading,
}: AccountFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankName: "",
      initialBalance: 0,
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nome da Conta / Banco"
        placeholder="Ex: Itaú, Nubank, Carteira..."
        {...register("bankName")}
        error={errors.bankName?.message}
      />

      <Input
        label="Saldo Inicial (R$)"
        type="number"
        step="0.01"
        placeholder="0,00"
        {...register("initialBalance")}
        error={errors.initialBalance?.message}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar Conta
        </Button>
      </div>
    </form>
  );
};
