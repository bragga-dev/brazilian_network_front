import { Briefcase, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { JobApplicationCard, ProjectApplicationCard } from "@/components/applications/ApplicationCards";
import { ApplyJobModal } from "@/components/applications/ApplyJobModal";
import { ApplyProjectModal } from "@/components/applications/ApplyProjectModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useJobApplicationMutations, useMyJobApplications, useMyProjectApplications, useProjectApplicationMutations } from "@/hooks/useApplications";
import type { ApplicationFilters, ApplicationStatus, JobApplication, ProjectApplication } from "@/types/application";
import { getErrorMessage } from "@/utils/errors";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Enviadas" },
  { value: "in_review", label: "Em análise" },
  { value: "accepted", label: "Aprovadas" },
  { value: "rejected", label: "Recusadas" },
  { value: "withdrawn", label: "Retiradas" },
];

type Confirm<T> = { action: "withdraw" | "delete"; item: T } | null;

const CONFIRM_TEXT = {
  withdraw: { title: "Retirar candidatura", message: "A candidatura fica registrada como retirada e não pode ser refeita para esta oportunidade.", label: "Retirar" },
  delete: { title: "Excluir candidatura", message: "A candidatura será removida do seu histórico. Esta ação não pode ser desfeita.", label: "Excluir" },
} as const;

function JobApplicationsTab({ filters, onPage }: { filters: ApplicationFilters; onPage: (page: number) => void }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyJobApplications(filters);

  // Excluiu o último item da última página: volta uma página em vez de mostrar "nenhuma candidatura" com total > 0.
  useEffect(() => {
    if (data && data.items.length === 0 && data.total > 0 && filters.page && filters.page > 1) onPage(filters.page - 1);
  }, [data, filters.page, onPage]);
  const { withdraw, remove } = useJobApplicationMutations();
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [confirm, setConfirm] = useState<Confirm<JobApplication>>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const run = async () => {
    if (!confirm) return;
    setFailure(null);
    try {
      if (confirm.action === "withdraw") await withdraw.mutateAsync(confirm.item.send_job_application_id);
      else await remove.mutateAsync(confirm.item.send_job_application_id);
      setConfirm(null);
    } catch (err) {
      setConfirm(null);
      setFailure(getErrorMessage(err));
    }
  };

  return (
    <section aria-busy={isFetching}>
      {isLoading && <Spinner />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {failure && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
      {data && data.items.length === 0 && <EmptyState title="Nenhuma candidatura a vagas">Quando você se candidatar, ela aparece aqui com o andamento.</EmptyState>}
      {data && data.items.length > 0 && (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {data.items.map((item) => (
              <JobApplicationCard
                key={item.send_job_application_id}
                item={item}
                onEdit={setEditing}
                onWithdraw={(target) => setConfirm({ action: "withdraw", item: target })}
                onDelete={(target) => setConfirm({ action: "delete", item: target })}
              />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={onPage} />
        </>
      )}

      <ApplyJobModal open={editing !== null} onClose={() => setEditing(null)} application={editing ?? undefined} />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? CONFIRM_TEXT[confirm.action].title : ""}
        message={confirm ? CONFIRM_TEXT[confirm.action].message : ""}
        confirmLabel={confirm ? CONFIRM_TEXT[confirm.action].label : undefined}
        loading={withdraw.isPending || remove.isPending}
        onConfirm={() => void run()}
        onClose={() => setConfirm(null)}
      />
    </section>
  );
}

function ProjectApplicationsTab({ filters, onPage }: { filters: ApplicationFilters; onPage: (page: number) => void }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyProjectApplications(filters);

  // Excluiu o último item da última página: volta uma página em vez de mostrar "nenhuma candidatura" com total > 0.
  useEffect(() => {
    if (data && data.items.length === 0 && data.total > 0 && filters.page && filters.page > 1) onPage(filters.page - 1);
  }, [data, filters.page, onPage]);
  const { withdraw, remove } = useProjectApplicationMutations();
  const [editing, setEditing] = useState<ProjectApplication | null>(null);
  const [confirm, setConfirm] = useState<Confirm<ProjectApplication>>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const run = async () => {
    if (!confirm) return;
    setFailure(null);
    try {
      if (confirm.action === "withdraw") await withdraw.mutateAsync(confirm.item.send_project_application_id);
      else await remove.mutateAsync(confirm.item.send_project_application_id);
      setConfirm(null);
    } catch (err) {
      setConfirm(null);
      setFailure(getErrorMessage(err));
    }
  };

  return (
    <section aria-busy={isFetching}>
      {isLoading && <Spinner />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {failure && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{failure}</p>}
      {data && data.items.length === 0 && <EmptyState title="Nenhuma proposta a projetos">Quando você enviar uma proposta, ela aparece aqui com o andamento.</EmptyState>}
      {data && data.items.length > 0 && (
        <>
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            {data.items.map((item) => (
              <ProjectApplicationCard
                key={item.send_project_application_id}
                item={item}
                onEdit={setEditing}
                onWithdraw={(target) => setConfirm({ action: "withdraw", item: target })}
                onDelete={(target) => setConfirm({ action: "delete", item: target })}
              />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={onPage} />
        </>
      )}

      <ApplyProjectModal open={editing !== null} onClose={() => setEditing(null)} application={editing ?? undefined} />
      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? CONFIRM_TEXT[confirm.action].title.replace("candidatura", "proposta") : ""}
        message={confirm ? CONFIRM_TEXT[confirm.action].message.replace("candidatura", "proposta") : ""}
        confirmLabel={confirm ? CONFIRM_TEXT[confirm.action].label : undefined}
        loading={withdraw.isPending || remove.isPending}
        onConfirm={() => void run()}
        onClose={() => setConfirm(null)}
      />
    </section>
  );
}

export default function MyApplicationsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") === "projetos" ? "projetos" : "vagas";
  const status = (params.get("status") ?? "") as ApplicationStatus | "";
  const page = Math.max(1, Number(params.get("page")) || 1);

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
  const filters: ApplicationFilters = { status, page, page_size: PAGE_SIZE };
  const onPage = (next: number) => update({ page: String(next) }, true);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel>Candidaturas</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Minhas candidaturas</h1>
      <p className="mt-2 text-slate-400">Acompanhe o andamento do que você enviou para vagas e projetos.</p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Tabs items={tabs} value={tab} onChange={(id) => update({ aba: id === "vagas" ? undefined : id })} />
        </div>
        <Field label="Situação" className="w-full sm:w-48">
          <Select value={status} onChange={(event) => update({ status: event.target.value })}>
            <option value="">Todas</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        {tab === "vagas" ? <JobApplicationsTab filters={filters} onPage={onPage} /> : <ProjectApplicationsTab filters={filters} onPage={onPage} />}
      </div>
    </div>
  );
}