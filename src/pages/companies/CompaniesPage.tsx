import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CompanyCard } from "@/components/companies/CompanyCard";
import { Field, Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
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
      <SectionLabel tone="yellow">Empresas</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Quem está contratando</h1>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[1fr_160px_auto] sm:items-end">
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
        <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={hasOpenJobs}
            onChange={(e) => update({ has_open_jobs: e.target.checked ? "true" : undefined })}
            className="size-4 accent-flag-green"
          />
          Só com vagas abertas
        </label>
      </div>

      <section className="mt-6" aria-busy={isFetching}>
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhuma empresa encontrada">Ajuste os filtros e tente de novo.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
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