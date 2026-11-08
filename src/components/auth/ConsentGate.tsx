import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";
import { useConsents, useUpdateConsents } from "@/hooks/useAccount";
import { getErrorMessage } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";

/** Se os termos/privacidade mudaram (needs_reacceptance), bloqueia a tela até o usuário aceitar a versão vigente. */
export function ConsentGate() {
  const { status, me, logout } = useAuth();
  const eligible = status === "authenticated" && me?.user.role !== "admin";
  const { data } = useConsents(eligible);
  const update = useUpdateConsents();

  if (!eligible || !data?.needs_reacceptance) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Panel className="w-full max-w-md bg-surface p-7 shadow-2xl">
        <h2 id="consent-title" className="text-xl font-bold text-white">
          Atualizamos nossos termos
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Para continuar usando a plataforma, aceite a versão vigente dos Termos de Uso ({data.current_terms_version}) e da Política de
          Privacidade ({data.current_privacy_version}).
        </p>
        {update.isError && (
          <div className="mt-4">
            <FormMessage tone="error">{getErrorMessage(update.error)}</FormMessage>
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" loading={update.isPending} onClick={() => update.mutate({ accepted_terms: true })}>
            Aceitar e continuar
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </Panel>
    </div>
  );
}