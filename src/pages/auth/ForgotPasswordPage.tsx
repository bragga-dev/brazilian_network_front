import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

const schema = z.object({ email: z.email("E-mail inválido") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormValues) => {
    setError(null);
    try {
      await authService.requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      label="Recuperação"
      title="Esqueci minha senha"
      subtitle="Enviaremos um link para você criar uma nova senha."
      footer={
        <Link to="/entrar" className="text-flag-yellow hover:underline">
          ← Voltar ao login
        </Link>
      }
    >
      {done ? (
        <FormMessage tone="success">Se o e-mail estiver cadastrado, você receberá o link em instantes.</FormMessage>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Field label="E-mail" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Enviar link →
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
