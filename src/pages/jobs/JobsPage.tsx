import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { LockedNotice } from "@/components/ui/LockedNotice";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useJobs } from "@/hooks/useJobs";
import { usePrivateAccess } from "@/hooks/usePrivateAccess";
import { getErrorMessage } from "@/utils/errors";

export default function JobsPage() {
  const { filters, update, clear, hasActive } = useJobFilters();
  const { data, isPending, isError, error, refetch, isFetching } = useJobs(filters);
  const canViewPrivate = usePrivateAccess();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel>Vagas</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Encontre sua próxima vaga</h1>
      <p className="mt-2 text-slate-400">{data ? `${data.total} ${data.total === 1 ? "vaga encontrada" : "vagas encontradas"}` : " "}</p>

      {!canViewPrivate && (
        <div className="mt-6">
          <LockedNotice>Descrição, requisitos, benefícios e remuneração das vagas são exibidos só para usuários cadastrados e com e-mail verificado.</LockedNotice>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <JobFilters filters={filters} onChange={update} onClear={clear} hasActive={hasActive} restricted={!canViewPrivate} />

        <section aria-busy={isFetching}>
          {isPending && !isError && <Spinner />}
          {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
          {data && data.items.length === 0 && (
            <EmptyState title="Nenhuma vaga encontrada">Tente remover alguns filtros ou buscar por outro termo.</EmptyState>
          )}
          {data && data.items.length > 0 && (
            <>
              <div className={`space-y-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {data.items.map((job) => (
                  <JobCard key={job.job_id} job={job} />
                ))}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={(page) => update({ page })} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}