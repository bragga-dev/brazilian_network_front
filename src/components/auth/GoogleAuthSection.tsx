import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import type { RegisterRole } from "@/types/auth";
import { cn } from "@/utils/cn";
import { getErrorMessage, getStatus } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";
import { GOOGLE_CLIENT_ID, GoogleButton } from "./GoogleButton";

interface Props {
  mode: "login" | "register";
  /** Na tela de cadastro, role/aceite vêm do formulário. No login, só são pedidos se a conta for nova. */
  role?: RegisterRole;
  acceptedTerms?: boolean;
  marketingOptIn?: boolean;
  onSuccess: () => void;
}

const ROLES: { value: RegisterRole; label: string }[] = [
  { value: "dev", label: "Sou dev" },
  { value: "company", label: "Sou empresa" },
];

export function GoogleAuthSection({ mode, role, acceptedTerms = false, marketingOptIn = false, onSuccess }: Props) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Conta nova sem aceite: guardamos o credential e pedimos role + aceite antes de reenviar.
  const [pending, setPending] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<RegisterRole>(role ?? "dev");
  const [newTerms, setNewTerms] = useState(false);
  const [newMarketing, setNewMarketing] = useState(false);

  if (!GOOGLE_CLIENT_ID && !import.meta.env.DEV) return null;

  const submit = async (idToken: string, payload: { role: RegisterRole; accepted: boolean; marketing: boolean }) => {
    setBusy(true);
    setError(null);
    try {
      await loginWithGoogle({
        id_token: idToken,
        role: payload.role,
        accepted_terms: payload.accepted,
        marketing_opt_in: payload.marketing,
      });
      onSuccess();
    } catch (err) {
      if (getStatus(err) === 400 && !payload.accepted) {
        setPending(idToken); // backend: conta nova exige aceite dos termos
      } else {
        setPending(null);
        setError(getErrorMessage(err, "Não foi possível entrar com o Google."));
      }
    } finally {
      setBusy(false);
    }
  };

  const onCredential = (credential: string) =>
    void submit(credential, { role: role ?? "dev", accepted: acceptedTerms, marketing: marketingOptIn });

  return (
    <div className="space-y-3">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      {pending ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-slate-300">Não encontramos uma conta com esse e-mail. Para criar uma, escolha o tipo e aceite os termos.</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de conta">
            {ROLES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={newRole === option.value}
                onClick={() => setNewRole(option.value)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  newRole === option.value ? "border-flag-green bg-flag-green/10 text-flag-green" : "border-white/10 text-slate-400 hover:border-white/30",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={newTerms} onChange={(e) => setNewTerms(e.target.checked)} className="mt-0.5 size-4 accent-flag-green" />
            <span>Li e aceito os termos de uso e a política de privacidade.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={newMarketing} onChange={(e) => setNewMarketing(e.target.checked)} className="mt-0.5 size-4 accent-flag-green" />
            <span>Quero receber novidades por e-mail.</span>
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              loading={busy}
              disabled={!newTerms}
              className="flex-1"
              onClick={() => void submit(pending, { role: newRole, accepted: newTerms, marketing: newMarketing })}
            >
              Criar conta com Google
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPending(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <GoogleButton onCredential={onCredential} disabled={busy} text={mode === "register" ? "signup_with" : "signin_with"} />
      )}
    </div>
  );
}

export function OrDivider() {
  if (!GOOGLE_CLIENT_ID && !import.meta.env.DEV) return null;
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500" role="separator">
      <span className="h-px flex-1 bg-white/10" />
      ou
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}