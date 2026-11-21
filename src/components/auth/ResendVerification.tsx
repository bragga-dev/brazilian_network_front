import { useState } from "react";

import { FormMessage } from "@/components/layout/AuthShell";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

/** Reenvia o e-mail de verificação. O backend responde igual exista ou não o e-mail (não revela cadastros). */
export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    setState("sending");
    setError(null);
    try {
      await authService.resendVerification(email);
      setState("done");
    } catch (err) {
      setError(getErrorMessage(err));
      setState("idle");
    }
  };

  if (state === "done") {
    return <FormMessage tone="success">Se o e-mail estiver pendente de verificação, enviamos um novo link. Veja também a caixa de spam.</FormMessage>;
  }

  return (
    <div className="space-y-3">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <button type="button" disabled={state === "sending" || !email} onClick={() => void resend()} className="text-sm text-flag-yellow hover:underline disabled:opacity-50">
        {state === "sending" ? "Enviando..." : "Reenviar e-mail de verificação"}
      </button>
    </div>
  );
}