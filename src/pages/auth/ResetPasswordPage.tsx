import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

const schema = z
  .object({
    new_password: z.string().min(8, "Mínimo de 8 caracteres"),
    new_password2: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.new_password === data.new_password2, { path: ["new_password2"], message: "As senhas não coincidem" });
type FormValues = z.infer<typeof schema>;

/** Destino do link do e-mail: /redefinir-senha?uid=...&token=... */
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");

  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!uid || !token) {
    return (
      <AuthShell label="Recuperação" title="Link inválido">
        <FormMessage tone="error">O link de redefinição está incompleto ou expirou.</FormMessage>
        <Link to="/esqueci-senha" className={buttonClasses("secondary", "md", "mt-5 w-full")}>
          Pedir novo link
        </Link>
      </AuthShell>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await authService.confirmPasswordReset({ uid, token, ...values });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell label="Recuperação" title="Nova senha">
      {done ? (
        <>
          <FormMessage tone="success">Senha alterada com sucesso.</FormMessage>
          <Link to="/entrar" className={buttonClasses("primary", "md", "mt-5 w-full")}>
            Ir para o login →
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Field label="Nova senha" error={errors.new_password?.message}>
            <Input type="password" autoComplete="new-password" {...register("new_password")} />
          </Field>
          <Field label="Confirmar nova senha" error={errors.new_password2?.message}>
            <Input type="password" autoComplete="new-password" {...register("new_password2")} />
          </Field>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Salvar nova senha →
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
