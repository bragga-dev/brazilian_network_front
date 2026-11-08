import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useJobs } from "@/hooks/useJobs";
import { getErrorMessage } from "@/utils/errors";

export default function JobsPage() {
  const { filters, update, clear, hasActive } = useJobFilters();
  const { data, isLoading, isError, error, refetch, isFetching } = useJobs(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
      <SectionLabel>Vagas</SectionLabel>
      <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Encontre sua próxima vaga</h1>
      <p className="mt-2 text-slate-400">{data ? `${data.total} ${data.total === 1 ? "vaga encontrada" : "vagas encontradas"}` : " "}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <JobFilters filters={filters} onChange={update} onClear={clear} hasActive={hasActive} />

        <section aria-busy={isFetching}>
          {isLoading && <Spinner />}
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
