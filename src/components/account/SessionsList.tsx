import { Laptop } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import { useRevokeSession, useSessions } from "@/hooks/useAccount";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");

export function SessionsList() {
  const { endSession } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useSessions();
  const revoke = useRevokeSession();
  const [busyAll, setBusyAll] = useState(false);
  const [allError, setAllError] = useState<string | null>(null);

  const logoutAll = async () => {
    setBusyAll(true);
    setAllError(null);
    try {
      await authService.logoutAll();
      endSession();
      navigate("/entrar", { replace: true });
    } catch (err) {
      setAllError(getErrorMessage(err));
      setBusyAll(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      {(allError || revoke.isError) && <FormMessage tone="error">{allError ?? getErrorMessage(revoke.error)}</FormMessage>}
      <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
        {(data ?? []).map((session) => (
          <li key={session.id} className="flex items-center gap-4 p-4">
            <Laptop className="size-5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.device || "Dispositivo desconhecido"}</p>
              <p className="text-xs text-slate-500">
                Iniciada em {when(session.created_at)} · expira em {when(session.expires_at)}
              </p>
            </div>
            <Button variant="secondary" size="sm" loading={revoke.isPending && revoke.variables === session.id} onClick={() => revoke.mutate(session.id)}>
              Encerrar
            </Button>
          </li>
        ))}
        {data?.length === 0 && <li className="p-4 text-sm text-slate-500">Nenhuma sessão ativa.</li>}
      </ul>
      <Button variant="danger" size="sm" loading={busyAll} onClick={() => void logoutAll()}>
        Sair de todos os dispositivos
      </Button>
    </div>
  );
}