import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CompanyCard } from "@/components/companies/CompanyCard";
import { SlidersHorizontal, X } from "lucide-react";

import { Field, Input, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { STATES } from "@/constants/jobOptions";
import { useCompanies } from "@/hooks/useCompanies";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/errors";

export default function CompaniesPage() {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const hasOpenJobs = params.get("has_open_jobs") === "true";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [q, setQ] = useState(urlQ);
  const dq = useDebounce(q);

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

  useEffect(() => {
    if (dq !== urlQ) update({ q: dq });
  }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError, error, refetch, isFetching } = useCompanies({
    q: urlQ,
    state,
    has_open_jobs: hasOpenJobs || undefined,
    page,
    page_size: 12,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <PageHeader
        label="Empresas"
        tone="yellow"
        title="Quem está contratando"
        description="Conheça as empresas da rede, onde estão e quais têm vagas abertas agora."
        aside={
          <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400" aria-live="polite">
            {data ? (
              <>
                <span className="font-bold text-white">{data.total}</span> {data.total === 1 ? "empresa" : "empresas"}
              </>
            ) : (
              "Carregando..."
            )}
          </p>
        }
      />

      <Panel className="mt-8 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <SlidersHorizontal className="size-4 text-flag-green" aria-hidden /> Filtros
          </p>
          {(urlQ || state || hasOpenJobs) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setParams({}, { replace: true });
              }}
              className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
            >
              <X className="size-4" aria-hidden /> Limpar filtros
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
          <Field label="Buscar empresa">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome fantasia" />
          </Field>
          <Field label="Estado">
            <Select value={state} onChange={(e) => update({ state: e.target.value })}>
              <option value="">Todos</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <ToggleChip active={hasOpenJobs} onClick={() => update({ has_open_jobs: hasOpenJobs ? undefined : "true" })}>
            Só com vagas abertas
          </ToggleChip>
        </div>
      </Panel>

      <section className="mt-6" aria-busy={isFetching}>
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhuma empresa encontrada">Ajuste os filtros e tente de novo.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((company) => (
                <CompanyCard key={company.company_id} company={company} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(next) => update({ page: String(next) }, true)} />
          </>
        )}
      </section>
    </div>
  );
}