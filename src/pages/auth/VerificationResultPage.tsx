import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ResendVerification } from "@/components/auth/ResendVerification";
import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { buttonClasses } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/** Destino do redirect do backend após clicar no link do e-mail de verificação. */
export default function VerificationResultPage() {
  const [params] = useSearchParams();
  const success = params.get("status") === "success";
  const [email, setEmail] = useState(params.get("email") ?? "");

  return (
    <AuthShell label="Verificação" title={success ? "E-mail confirmado" : "Não foi possível confirmar"}>
      {success ? (
        <FormMessage tone="success">Tudo certo! Agora você já pode entrar na sua conta.</FormMessage>
      ) : (
        <div className="space-y-4">
          <FormMessage tone="error">O link é inválido ou expirou. Informe seu e-mail para receber um novo.</FormMessage>
          <Field label="E-mail">
            <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <ResendVerification email={email.trim()} />
        </div>
      )}
      <Link to="/entrar" className={buttonClasses("primary", "md", "mt-5 w-full")}>
        Ir para o login →
      </Link>
    </AuthShell>
  );
}