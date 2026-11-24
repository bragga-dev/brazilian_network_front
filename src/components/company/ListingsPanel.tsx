import { Briefcase, FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { JobFormModal } from "@/components/company/JobFormModal";
import { ProjectFormModal } from "@/components/company/ProjectFormModal";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useListingMutations, useManagedJobs, useManagedProjects } from "@/hooks/useManage";
import type { ManagedJob, ManagedProject } from "@/types/manage";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatMoney } from "@/utils/format";

const PAGE_SIZE = 10;

type Tone = "neutral" | "green" | "yellow" | "blue" | "purple" | "red";
const STATUS_TONE: Record<string, Tone> = { draft: "neutral", published: "green", paused: "yellow", in_progress: "blue", completed: "purple", closed: "red" };

const JOB_STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicada" },
  { value: "paused", label: "Pausada" },
  { value: "closed", label: "Encerrada" },
];
const PROJECT_STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "paused", label: "Pausado" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluído" },
  { value: "closed", label: "Encerrado" },
];

type Action = "publish" | "pause" | "close" | "remove" | "complete";
interface Pending {
  action: Action;
  id: string;
  title: string;
}

const CONFIRM: Record<"close" | "remove" | "complete", { title: string; message: (name: string) => string; label: string }> = {
  close: { title: "Encerrar", message: (name) => `"${name}" sai do ar e não poderá ser reaberta.`, label: "Encerrar" },
  remove: { title: "Excluir rascunho", message: (name) => `"${name}" será excluído definitivamente.`, label: "Excluir" },
  complete: { title: "Concluir projeto", message: (name) => `Marcar "${name}" como concluído libera a avaliação entre empresa e dev.`, label: "Concluir" },
};

interface RowProps {
  title: string;
  status: string;
  statusLabel: string;
  meta: string[];
  tags: string[];
  publicTo?: string;
  receivedTo?: string;
  buttons: { label: string; action: Action | "edit"; variant?: "secondary" | "primary" | "danger" | "purple" }[];
  onAction: (action: Action | "edit") => void;
  busy: boolean;
}

function Row({ title, status, statusLabel, meta, tags, publicTo, receivedTo, buttons, onAction, busy }: RowProps) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {publicTo ? (
            <Link to={publicTo} className="block truncate text-lg font-semibold text-white hover:text-flag-green">
              {title}
            </Link>
          ) : (
            <p className="truncate text-lg font-semibold text-white">{title}</p>
          )}
          <p className="mt-1 text-sm text-slate-400">{meta.join(" · ")}</p>
        </div>
        <Badge tone={STATUS_TONE[status] ?? "neutral"}>{statusLabel}</Badge>
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} tone="blue">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        {buttons.map((button) => (
          <Button key={button.label} size="sm" variant={button.variant ?? "secondary"} disabled={busy} onClick={() => onAction(button.action)}>
            {button.label}
          </Button>
        ))}
        {receivedTo && (
          <Link to={receivedTo} className={buttonClasses("ghost", "sm")}>
            Candidaturas
          </Link>
        )}
      </div>
    </Panel>
  );
}

function jobButtons(status: string): RowProps["buttons"] {
  if (status === "draft") return [{ label: "Editar", action: "edit" }, { label: "Publicar", action: "publish", variant: "primary" }, { label: "Excluir", action: "remove", variant: "danger" }];
  if (status === "published") return [{ label: "Editar", action: "edit" }, { label: "Pausar", action: "pause", variant: "purple" }, { label: "Encerrar", action: "close", variant: "danger" }];
  if (status === "paused") return [{ label: "Editar", action: "edit" }, { label: "Retomar", action: "publish", variant: "primary" }, { label: "Encerrar", action: "close", variant: "danger" }];
  return [];
}

function projectButtons(status: string): RowProps["buttons"] {
  if (status === "in_progress") return [{ label: "Concluir", action: "complete", variant: "primary" }, { label: "Encerrar", action: "close", variant: "danger" }];
  return jobButtons(status);
}

function Listing<T extends { status: string }>({
  kind,
  listClassName,
  filters,
  onPage,
  renderRow,
  query,
}: {
  kind: "job" | "project";
  listClassName: string;
  filters: { status: string; page: number };
  onPage: (page: number) => void;
  renderRow: (item: T, run: (action: Action | "edit", id: string, title: string) => void, busy: boolean, edit: (item: T) => void) => React.ReactNode;
  query: { data?: { items: T[]; page: number; pages: number }; isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown; isFetching: boolean };
}) {
  const mutations = useListingMutations(kind);
  const [pending, setPending] = useState<Pending | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const busy = Object.values(mutations).some((m) => m.isPending);
  const { data, isPending, isError, error, refetch, isFetching } = query;

  const execute = async (action: Action, id: string) => {
    setFailure(null);
    try {
      await mutations[action].mutateAsync(id);
      setPending(null);
    } catch (err) {
      setPending(null);
      setFailure(getErrorMessage(err));
    }
  };

  const run = (action: Action | "edit", id: string, title: string) => {
    if (action === "edit") return;
    if (action === "close" || action === "remove" || action === "complete") setPending({ action, id, title });
    else void execute(action, id);
  };

  return (
    <section aria-busy={isFetching}>
      {isPending && !isError && <Spinner />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {failure && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {failure}
        </p>
      )}
      {data && data.items.length === 0 && (
        <EmptyState title={filters.status ? "Nada com essa situação" : kind === "job" ? "Nenhuma vaga ainda" : "Nenhum projeto ainda"}>
          {filters.status ? "Troque o filtro de situação." : "Crie o primeiro como rascunho e publique quando estiver pronto."}
        </EmptyState>
      )}
      {data && data.items.length > 0 && (
        <>
          <div className={`${listClassName} ${isFetching ? "opacity-60" : ""}`}>{data.items.map((item) => renderRow(item, run, busy, setEditing))}</div>
          <Pagination page={data.page} pages={data.pages} onChange={onPage} />
        </>
      )}

      {kind === "job" ? (
        <JobFormModal open={editing !== null} onClose={() => setEditing(null)} job={(editing as unknown as ManagedJob) ?? undefined} />
      ) : (
        <ProjectFormModal open={editing !== null} onClose={() => setEditing(null)} project={(editing as unknown as ManagedProject) ?? undefined} />
      )}
      <ConfirmDialog
        open={pending !== null}
        title={pending ? CONFIRM[pending.action as keyof typeof CONFIRM].title : ""}
        message={pending ? CONFIRM[pending.action as keyof typeof CONFIRM].message(pending.title) : ""}
        confirmLabel={pending ? CONFIRM[pending.action as keyof typeof CONFIRM].label : undefined}
        loading={busy}
        onConfirm={() => pending && void execute(pending.action, pending.id)}
        onClose={() => setPending(null)}
      />
    </section>
  );
}

type ReceivedHref = (kind: "vagas" | "projetos", id: string) => string;

function JobsTab({ status, page, onPage, receivedHref, listClassName }: { status: string; page: number; onPage: (page: number) => void; receivedHref: ReceivedHref; listClassName: string }) {
  const query = useManagedJobs({ status, page, page_size: PAGE_SIZE });
  return (
    <Listing<ManagedJob>
      kind="job"
      listClassName={listClassName}
      filters={{ status, page }}
      onPage={onPage}
      query={query}
      renderRow={(job, run, busy, edit) => (
        <Row
          key={job.job_id}
          title={job.title}
          status={job.status}
          statusLabel={job.status_label}
          meta={[
            job.contract_type_label,
            job.work_model_label,
            job.experience_level_label,
            job.salary_min || job.salary_max ? `${job.salary_min ? formatMoney(job.salary_min) : "—"} a ${job.salary_max ? formatMoney(job.salary_max) : "—"}` : "Sem remuneração informada",
            job.expires_at ? `expira em ${formatDate(job.expires_at)}` : "ainda não publicada",
          ]}
          tags={[...job.areas.map((a) => a.name), ...job.technologies.slice(0, 4).map((t) => t.technology.name)]}
          publicTo={job.status === "published" ? `/vagas/${job.job_id}` : undefined}
          receivedTo={job.status === "draft" ? undefined : receivedHref("vagas", job.job_id)}
          buttons={jobButtons(job.status)}
          busy={busy}
          onAction={(action) => (action === "edit" ? edit(job) : run(action, job.job_id, job.title))}
        />
      )}
    />
  );
}

function ProjectsTab({ status, page, onPage, receivedHref, listClassName }: { status: string; page: number; onPage: (page: number) => void; receivedHref: ReceivedHref; listClassName: string }) {
  const query = useManagedProjects({ status, page, page_size: PAGE_SIZE });
  return (
    <Listing<ManagedProject>
      kind="project"
      listClassName={listClassName}
      filters={{ status, page }}
      onPage={onPage}
      query={query}
      renderRow={(project, run, busy, edit) => (
        <Row
          key={project.project_id}
          title={project.title}
          status={project.status}
          statusLabel={project.status_label}
          meta={[
            project.experience_level_label,
            `${project.estimated_duration_days} ${project.estimated_duration_days === 1 ? "dia" : "dias"}`,
            project.min_value || project.max_value ? `${project.min_value ? formatMoney(project.min_value) : "—"} a ${project.max_value ? formatMoney(project.max_value) : "—"}` : "Sem valor informado",
            project.expires_at ? `expira em ${formatDate(project.expires_at)}` : "ainda não publicado",
          ]}
          tags={[...project.areas.map((a) => a.name), ...project.technologies.slice(0, 4).map((t) => t.technology.name)]}
          publicTo={project.status === "published" ? `/projetos/${project.project_id}` : undefined}
          receivedTo={project.status === "draft" ? undefined : receivedHref("projetos", project.project_id)}
          buttons={projectButtons(project.status)}
          busy={busy}
          onAction={(action) => (action === "edit" ? edit(project) : run(action, project.project_id, project.title))}
        />
      )}
    />
  );
}

interface ListingsPanelProps {
  /** Dentro do perfil: sub-aba em `?tipo=` (a `?aba=` é do perfil), links de candidaturas apontam para o perfil e a lista usa duas colunas. */
  embedded?: boolean;
}

export function ListingsPanel({ embedded = false }: ListingsPanelProps) {
  const tabParam = embedded ? "tipo" : "aba";
  const [params, setParams] = useSearchParams();
  const tab = params.get(tabParam) === "projetos" ? "projetos" : "vagas";
  const status = params.get("status") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [creating, setCreating] = useState(false);

  const update = (patch: Record<string, string | undefined>, keepPage = false) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (!keepPage) next.delete("page");
        return next;
      },
      { replace: true },
    );

  const tabs: TabItem[] = [
    { id: "vagas", label: "Vagas", icon: Briefcase },
    { id: "projetos", label: "Projetos", icon: FolderKanban },
  ];
  const statuses = tab === "vagas" ? JOB_STATUSES : PROJECT_STATUSES;
  const onPage = (next: number) => update({ page: String(next) }, true);
  const receivedHref: ReceivedHref = (kind, id) =>
    embedded ? `/perfil?aba=candidaturas&tipo=${kind}&item=${id}` : `/empresa/candidaturas?aba=${kind}&item=${id}`;
  const listClassName = embedded ? "grid gap-4 xl:grid-cols-2" : "space-y-4";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Tabs items={tabs} value={tab} onChange={(id) => update({ [tabParam]: id === "vagas" ? undefined : id, status: undefined })} />
        </div>
        <Field label="Situação" className="w-full sm:w-48">
          <Select value={status} onChange={(event) => update({ status: event.target.value })}>
            <option value="">Todas</option>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" /> {tab === "vagas" ? "Nova vaga" : "Novo projeto"}
        </Button>
      </div>

      <div className="mt-6">
        {tab === "vagas" ? (
          <JobsTab status={status} page={page} onPage={onPage} receivedHref={receivedHref} listClassName={listClassName} />
        ) : (
          <ProjectsTab status={status} page={page} onPage={onPage} receivedHref={receivedHref} listClassName={listClassName} />
        )}
      </div>

      {tab === "vagas" ? <JobFormModal open={creating} onClose={() => setCreating(false)} /> : <ProjectFormModal open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}