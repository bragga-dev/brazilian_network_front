import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { Button } from "@/components/ui/Button";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { Panel } from "@/components/ui/Panel";
import type { ApplicationStatus, JobApplication, ProjectApplication } from "@/types/application";
import { formatDate, formatMoney } from "@/utils/format";

export interface ApplicationHandlers<T> {
  onEdit: (item: T) => void;
  onWithdraw: (item: T) => void;
  onDelete: (item: T) => void;
}

/** Regras do backend: edita só pendente; retira pendente/em análise; exclui pendente, recusada ou retirada. */
const canEdit = (status: ApplicationStatus) => status === "pending";
const canWithdraw = (status: ApplicationStatus) => status === "pending" || status === "in_review";
const canDelete = (status: ApplicationStatus) => status === "pending" || status === "rejected" || status === "withdrawn";

interface FrameProps<T> extends ApplicationHandlers<T> {
  item: T;
  status: ApplicationStatus;
  statusLabel: string;
  title: string;
  to: string;
  company: JobApplication["company"];
  createdAt: string;
  updatedAt: string;
  children?: ReactNode;
}

function Frame<T>({ item, status, statusLabel, title, to, company, createdAt, updatedAt, children, onEdit, onWithdraw, onDelete }: FrameProps<T>) {
  return (
    <Panel className="p-5">
      <div className="flex items-start gap-4">
        <PatriotAvatar shape="square" name={company.full_name} url={company.photo_url} patriot={company.is_patriot} className="size-12" textClassName="text-lg" />
        <div className="min-w-0 flex-1">
          <Link to={to} className="block truncate text-lg font-semibold text-white hover:text-flag-green">
            {title}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link to={`/empresas/${company.company_id}`} className="text-sm text-slate-400 hover:text-flag-green">
              {company.full_name}
            </Link>
            {company.is_patriot && <PatriotBadge />}
          </div>
        </div>
        <ApplicationStatusBadge status={status} label={statusLabel} />
      </div>

      {children}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="text-xs text-slate-500">
          Enviada em {formatDate(createdAt)}
          {updatedAt !== createdAt && ` · atualizada em ${formatDate(updatedAt)}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {canEdit(status) && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(item)}>
              Editar
            </Button>
          )}
          {canWithdraw(status) && (
            <Button variant="purple" size="sm" onClick={() => onWithdraw(item)}>
              Retirar
            </Button>
          )}
          {canDelete(status) && (
            <Button variant="danger" size="sm" onClick={() => onDelete(item)}>
              Excluir
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function JobApplicationCard({ item, ...handlers }: { item: JobApplication } & ApplicationHandlers<JobApplication>) {
  return (
    <Frame
      item={item}
      status={item.status}
      statusLabel={item.status_label}
      title={item.job_title}
      to={`/vagas/${item.job_id}`}
      company={item.company}
      createdAt={item.created_at}
      updatedAt={item.updated_at}
      {...handlers}
    >
      {item.cover_letter && <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-400">{item.cover_letter}</p>}
    </Frame>
  );
}

export function ProjectApplicationCard({ item, ...handlers }: { item: ProjectApplication } & ApplicationHandlers<ProjectApplication>) {
  return (
    <Frame
      item={item}
      status={item.status}
      statusLabel={item.status_label}
      title={item.project_title}
      to={`/projetos/${item.project_id}`}
      company={item.company}
      createdAt={item.created_at}
      updatedAt={item.updated_at}
      {...handlers}
    >
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-slate-500">Valor proposto:</dt>
          <dd className="font-semibold text-white">{formatMoney(item.proposed_value)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-slate-500">Prazo:</dt>
          <dd className="font-semibold text-white">
            {item.proposed_duration_days} {item.proposed_duration_days === 1 ? "dia" : "dias"}
          </dd>
        </div>
      </dl>
      {item.cover_letter && <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-400">{item.cover_letter}</p>}
    </Frame>
  );
}