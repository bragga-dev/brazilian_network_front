import { FileText, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { Panel } from "@/components/ui/Panel";
import type { ApplicationStatus } from "@/types/application";
import type { ApplicantDev } from "@/types/manage";
import { formatDate } from "@/utils/format";

interface Props {
  dev: ApplicantDev;
  opportunityTitle: string;
  opportunityTo: string;
  status: ApplicationStatus;
  statusLabel: string;
  createdAt: string;
  coverLetter: string;
  /** Linhas extras (valor e prazo da proposta de projeto). */
  extra?: ReactNode;
  actions: ReactNode;
}

/** Candidatura recebida: quem se candidatou, a que, a mensagem e as ações permitidas para o status atual. */
export function ApplicantCard({ dev, opportunityTitle, opportunityTo, status, statusLabel, createdAt, coverLetter, extra, actions }: Props) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PatriotAvatar name={dev.full_name} url={dev.photo_url} patriot={dev.is_patriot} className="size-12" />
          <div className="min-w-0">
            <Link to={`/devs/${dev.dev_id}`} className="block truncate font-semibold text-white hover:text-flag-green">
              {dev.full_name}
            </Link>
            <p className="truncate text-sm text-slate-400">{dev.headline || "Dev"}</p>
          </div>
        </div>
        <ApplicationStatusBadge status={status} label={statusLabel} />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        Para{" "}
        <Link to={opportunityTo} className="font-medium text-slate-200 hover:text-flag-green">
          {opportunityTitle}
        </Link>{" "}
        · {formatDate(createdAt)}
      </p>

      {extra}

      <p className="mt-3 whitespace-pre-line rounded-lg bg-white/[0.03] p-3 text-sm text-slate-300">{coverLetter}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {dev.is_patriot && <PatriotBadge />}
        {dev.curriculum_url && (
          <a href={dev.curriculum_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-flag-green hover:underline">
            <FileText className="size-4" aria-hidden /> Currículo
          </a>
        )}
        <Link to={`/devs/${dev.dev_id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <MapPin className="size-4" aria-hidden /> Ver perfil completo
        </Link>
      </div>

      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">{actions}</div>}
    </Panel>
  );
}