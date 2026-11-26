import { Briefcase, FolderKanban } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ApplicantCard } from "@/components/company/ApplicantCard";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useManagedJobs, useManagedProjects, useReceivedJobs, useReceivedMutations, useReceivedProjects } from "@/hooks/useManage";
import type { ApplicationStatus } from "@/types/application";
import type { ReceivedJobApplication, ReceivedProjectApplication } from "@/types/manage";
import { canStartChat } from "@/utils/chat";
import { getErrorMessage } from "@/utils/errors";
import { formatMoney } from "@/utils/format";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "in_review", label: "Em análise" },
  { value: "accepted", label: "Aprovada" },
  { value: "rejected", label: "Recusada" },
  { value: "withdrawn", label: "Retirada" },
];

type Decision = "review" | "accept" | "reject";
const CONFIRMS: Record<Exclude<Decision, "review">, { title: string; label: string; variant: "danger" | "primary"; message: (kind: "job" | "project", name: string) => string }> = {
  accept: {
    title: "Aprovar candidatura",
    label: "Aprovar",
    variant: "primary",
    message: (kind, name) =>
      kind === "project"
        ? `Aprovar ${name} atribui o dev ao projeto e o coloca em andamento. As demais propostas abertas deste projeto serão recusadas.`
        : `Aprovar ${name}? A decisão não pode ser desfeita.`,
  },
  reject: { title: "Recusar candidatura", label: "Recusar", variant: "danger", message: (_kind, name) => `Recusar ${name}? A decisão não pode ser desfeita.` },
};

interface Row {
  id: string;
  status: ApplicationStatus;
}

function Decisions({ kind, row, name, onDone }: { kind: "job" | "project"; row: Row; name: string; onDone: (message: string | null) => void }) {
  const mutations = useReceivedMutations(kind);
  const [confirm, setConfirm] = useState<Exclude<Decision, "review"> | null>(null);
  const busy = mutations.review.isPending || mutations.accept.isPending || mutations.reject.isPending;
  const open = row.status === "pending" || row.status === "in_review";
  const canChat = canStartChat(row.status);
  if (!open && !canChat) return null;

  const run = async (decision: Decision) => {
    onDone(null);
    try {
      await mutations[decision].mutateAsync(row.id);
    } catch (error) {
      onDone(getErrorMessage(error));
    } finally {
      setConfirm(null);
    }
  };

  return (
    <>
      {canChat && <StartChatButton kind={kind} applicationId={row.id} />}
      {row.status === "pending" && (
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => void run("review")}>
          Marcar em análise
        </Button>
      )}
      {open && (
        <>
          <Button size="sm" variant="primary" disabled={busy} onClick={() => setConfirm("accept")}>
            Aprovar
          </Button>
          <Button size="sm" variant="danger" disabled={busy} onClick={() => setConfirm("reject")}>
            Recusar
          </Button>
        </>
      )}
      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? CONFIRMS[confirm].title : ""}
        message={confirm ? CONFIRMS[confirm].message(kind, name) : ""}
        confirmLabel={confirm ? CONFIRMS[confirm].label : undefined}
        variant={confirm ? CONFIRMS[confirm].variant : "danger"}
        loading={busy}
        onConfirm={() => confirm && void run(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

interface ReceivedApplicationsPanelProps {
  /** Dentro do perfil: sub-aba em `?tipo=` (a `?aba=` é do perfil) e lista em duas colunas. */
  embedded?: boolean;
}

export function ReceivedApplicationsPanel({ embedded = false }: ReceivedApplicationsPanelProps) {
  const tabParam = embedded ? "tipo" : "aba";
  const [params, setParams] = useSearchParams();
  const tab = params.get(tabParam) === "projetos" ? "projetos" : "vagas";
  const item = params.get("item") ?? "";
  const status = (params.get("status") ?? "") as ApplicationStatus | "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [failure, setFailure] = useState<string | null>(null);

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

  const filters = { opportunity_id: item, status, page, page_size: PAGE_SIZE };
  const jobs = useReceivedJobs(filters, tab === "vagas");
  const projects = useReceivedProjects(filters, tab === "projetos");
  const jobOptions = useManagedJobs({ page_size: 100 }, tab === "vagas");
  const projectOptions = useManagedProjects({ page_size: 100 }, tab === "projetos");
  const query = tab === "vagas" ? jobs : projects;
  const options = tab === "vagas" ? (jobOptions.data?.items ?? []).map((j) => ({ id: j.job_id, title: j.title })) : (projectOptions.data?.items ?? []).map((p) => ({ id: p.project_id, title: p.title }));

  const tabs: TabItem[] = [
    { id: "vagas", label: "Vagas", icon: Briefcase },
    { id: "projetos", label: "Projetos", icon: FolderKanban },
  ];
  const { data, isPending, isError, error, refetch, isFetching } = query;

  return (
    <div>
      <div>
        <Tabs items={tabs} value={tab} onChange={(id) => update({ [tabParam]: id === "vagas" ? undefined : id, item: undefined, status: undefined })} />
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
        <Field label={tab === "vagas" ? "Vaga" : "Projeto"}>
          <Select value={item} onChange={(event) => update({ item: event.target.value })}>
            <option value="">Todas</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Situação">
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

      <section className="mt-6" aria-busy={isFetching}>
        {failure && (
          <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {failure}
          </p>
        )}
        {isPending && !isError && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhuma candidatura encontrada">Quando alguém se candidatar, aparece aqui.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`${embedded ? "grid gap-4 xl:grid-cols-2" : "space-y-4"} ${isFetching ? "opacity-60" : ""}`}>
              {tab === "vagas"
                ? (data.items as ReceivedJobApplication[]).map((application) => (
                    <ApplicantCard
                      key={application.send_job_application_id}
                      dev={application.dev}
                      opportunityTitle={application.job_title}
                      opportunityTo={`/vagas/${application.job_id}`}
                      status={application.status}
                      statusLabel={application.status_label}
                      createdAt={application.created_at}
                      coverLetter={application.cover_letter}
                      actions={<Decisions kind="job" row={{ id: application.send_job_application_id, status: application.status }} name={application.dev.full_name} onDone={setFailure} />}
                    />
                  ))
                : (data.items as ReceivedProjectApplication[]).map((application) => (
                    <ApplicantCard
                      key={application.send_project_application_id}
                      dev={application.dev}
                      opportunityTitle={application.project_title}
                      opportunityTo={`/projetos/${application.project_id}`}
                      status={application.status}
                      statusLabel={application.status_label}
                      createdAt={application.created_at}
                      coverLetter={application.cover_letter}
                      extra={
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                          <span>
                            Proposta: <strong className="text-white">{formatMoney(application.proposed_value)}</strong>
                          </span>
                          <span>
                            Prazo: <strong className="text-white">{application.proposed_duration_days} dias</strong>
                          </span>
                        </div>
                      }
                      actions={<Decisions kind="project" row={{ id: application.send_project_application_id, status: application.status }} name={application.dev.full_name} onDone={setFailure} />}
                    />
                  ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(next) => update({ page: String(next) }, true)} />
          </>
        )}
      </section>
    </div>
  );
}