import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ApplyJobModal } from "@/components/applications/ApplyJobModal";
import { ApplyProjectModal } from "@/components/applications/ApplyProjectModal";
import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMyApplicationIndex } from "@/hooks/useApplications";
import type { ApplicationKind } from "@/types/application";
import { getRequiredCompletion } from "@/utils/profileCompletion";

interface Props {
  kind: ApplicationKind;
  target: { id: string; title: string };
}

/** Botão de candidatura/proposta: cobre visitante, empresa, perfil incompleto, já candidatado e o caso normal. */
export function ApplyAction({ kind, target }: Props) {
  const { status, me } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isDev = status === "authenticated" && me?.user.role === "dev";
  const { data: index, isLoading } = useMyApplicationIndex(kind, isDev);

  const label = kind === "job" ? "Candidatar-se" : "Enviar proposta";

  if (status === "loading") return <span className={buttonClasses("primary", "md", "mt-5 w-full opacity-50")}>{label}</span>;

  if (status === "anonymous") {
    return (
      <Link to="/entrar" state={{ from: `${location.pathname}${location.search}` }} className={buttonClasses("primary", "md", "mt-5 w-full")}>
        Entre para {kind === "job" ? "se candidatar" : "enviar proposta"}
      </Link>
    );
  }

  if (!isDev || !me) {
    return <p className="mt-5 text-sm text-slate-400">Apenas contas de dev podem {kind === "job" ? "se candidatar a vagas" : "enviar propostas"}.</p>;
  }

  const existing = index?.get(target.id);
  if (existing) {
    return (
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          {kind === "job" ? "Sua candidatura:" : "Sua proposta:"} <ApplicationStatusBadge status={existing.status} label={existing.status_label} />
        </div>
        {existing.status === "withdrawn" && <p className="text-xs text-slate-500">Retirada: não é possível refazer para esta oportunidade.</p>}
        <Link to={`/candidaturas?aba=${kind === "job" ? "vagas" : "projetos"}`} className={buttonClasses("secondary", "md", "w-full")}>
          Ver minhas candidaturas
        </Link>
      </div>
    );
  }

  const pending = getRequiredCompletion(me);
  if (pending) {
    return (
      <div className="mt-5 space-y-3">
        <p className="text-sm text-flag-yellow">{pending.message}</p>
        <Link to={`/perfil?aba=${pending.tab}`} className={buttonClasses("secondary", "md", "w-full")}>
          Completar perfil
        </Link>
      </div>
    );
  }

  return (
    <>
      <button type="button" disabled={isLoading} onClick={() => setOpen(true)} className={buttonClasses("primary", "md", "mt-5 w-full")}>
        {label}
      </button>
      {kind === "job" ? (
        <ApplyJobModal open={open} onClose={() => setOpen(false)} job={{ job_id: target.id, title: target.title }} />
      ) : (
        <ApplyProjectModal open={open} onClose={() => setOpen(false)} project={{ project_id: target.id, title: target.title }} />
      )}
    </>
  );
}