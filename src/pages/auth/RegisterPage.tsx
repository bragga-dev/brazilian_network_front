import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { authService } from "@/services/auth.service";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/errors";

const schema = z
  .object({
    role: z.enum(["dev", "company"]),
    email: z.email("E-mail inválido"),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    password2: z.string().min(1, "Confirme a senha"),
    accepted_terms: z.boolean().refine((value) => value, "Aceite os termos para continuar"),
    marketing_opt_in: z.boolean(),
  })
  .refine((data) => data.password === data.password2, { path: ["password2"], message: "As senhas não coincidem" });
type FormValues = z.infer<typeof schema>;

const ROLES = [
  { value: "dev", label: "Sou dev" },
  { value: "company", label: "Sou empresa" },
] as const;

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: params.get("tipo") === "company" ? "company" : "dev",
      email: "",
      password: "",
      password2: "",
      accepted_terms: false,
      marketing_opt_in: false,
    },
  });
  const role = watch("role");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await authService.register(values);
      setSentTo(values.email);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível criar a conta."));
    }
  };

  if (sentTo) {
    return (
      <AuthShell label="Quase lá" title="Verifique seu e-mail">
        <FormMessage tone="success">
          Enviamos um link de confirmação para <strong>{sentTo}</strong>. Confirme o e-mail para poder entrar.
        </FormMessage>
        <Link to="/entrar" className="mt-5 inline-block text-sm text-flag-yellow hover:underline">
          Ir para o login →
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      label="Cadastro"
      title="Criar conta"
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/entrar" className="text-flag-yellow hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de conta">
          {ROLES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={role === option.value}
              onClick={() => setValue("role", option.value)}
              className={cn(
                "border px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                role === option.value
                  ? "border-flag-yellow bg-flag-yellow/10 text-flag-yellow"
                  : "border-white/10 text-slate-400 hover:border-white/30",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Field label="E-mail" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Senha" error={errors.password?.message} hint="Mínimo de 8 caracteres.">
          <Input type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Field label="Confirmar senha" error={errors.password2?.message}>
          <Input type="password" autoComplete="new-password" {...register("password2")} />
        </Field>

        <div className="space-y-2 text-sm text-slate-300">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 size-4 accent-flag-green" {...register("accepted_terms")} />
            <span>Li e aceito os termos de uso e a política de privacidade.</span>
          </label>
          {errors.accepted_terms && (
            <p role="alert" className="text-xs text-red-400">
              {errors.accepted_terms.message}
            </p>
          )}
          <label className="flex items-start gap-2 text-slate-400">
            <input type="checkbox" className="mt-0.5 size-4 accent-flag-green" {...register("marketing_opt_in")} />
            <span>Quero receber novidades por e-mail.</span>
          </label>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Criar conta →
        </Button>
      </form>
    </AuthShell>
  );
}
