import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";

const schema = z
  .object({
    old_password: z.string().min(1, "Informe a senha atual"),
    new_password: z.string().min(8, "Mínimo de 8 caracteres"),
    new_password2: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.new_password === data.new_password2, { path: ["new_password2"], message: "As senhas não coincidem" });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setDone(false);
    try {
      await authService.changePassword(values);
      setDone(true);
      reset();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível alterar a senha."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {done && <FormMessage tone="success">Senha alterada. Suas outras sessões foram encerradas.</FormMessage>}
      <Field label="Senha atual" error={errors.old_password?.message}>
        <PasswordInput autoComplete="current-password" {...register("old_password")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nova senha" error={errors.new_password?.message}>
          <PasswordInput autoComplete="new-password" {...register("new_password")} />
        </Field>
        <Field label="Confirmar nova senha" error={errors.new_password2?.message}>
          <PasswordInput autoComplete="new-password" {...register("new_password2")} />
        </Field>
      </div>
      <p className="text-xs text-slate-500">
        Entrou só com o Google e nunca definiu uma senha? Use “Esqueci minha senha” na tela de login para criar uma.
      </p>
      <Button type="submit" loading={isSubmitting}>
        Alterar senha
      </Button>
    </form>
  );
}