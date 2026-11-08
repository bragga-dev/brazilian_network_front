import { Link, useSearchParams } from "react-router-dom";

import { AuthShell, FormMessage } from "@/components/layout/AuthShell";
import { buttonClasses } from "@/components/ui/Button";

/** Destino do redirect do backend após clicar no link do e-mail de verificação. */
export default function VerificationResultPage() {
  const [params] = useSearchParams();
  const success = params.get("status") === "success";
  const message = params.get("message");

  return (
    <AuthShell label="Verificação" title={success ? "E-mail confirmado" : "Não foi possível confirmar"}>
      <FormMessage tone={success ? "success" : "error"}>
        {success ? "Tudo certo! Agora você já pode entrar na sua conta." : (message ?? "O link é inválido ou expirou.")}
      </FormMessage>
      <Link to="/entrar" className={buttonClasses("primary", "md", "mt-5 w-full")}>
        Ir para o login →
      </Link>
    </AuthShell>
  );
}
