import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { getErrorMessage, getStatus } from "@/utils/errors";

const schema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setUnverified(false);
    setResent(false);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setUnverified(getStatus(err) === 403);
      setError(getErrorMessage(err, "Não foi possível entrar."));
    }
  };

  const resend = async () => {
    try {
      await authService.resendVerification(getValues("email"));
      setResent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell
      label="Acesso"
      title="Entrar"
      subtitle="Use seu e-mail e senha."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-flag-yellow hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && <FormMessage tone="error">{error}</FormMessage>}
        {unverified && !resent && (
          <button type="button" onClick={() => void resend()} className="text-sm text-flag-yellow hover:underline">
            Reenviar e-mail de verificação
          </button>
        )}
        {resent && <FormMessage tone="success">Se o e-mail existir, enviamos um novo link de verificação.</FormMessage>}

        <Field label="E-mail" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Senha" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register("password")} />
        </Field>

        <div className="text-right">
          <Link to="/esqueci-senha" className="text-xs text-slate-400 hover:text-flag-yellow">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Entrar →
        </Button>
      </form>
    </AuthShell>
  );
}
