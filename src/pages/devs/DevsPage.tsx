import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DevCard } from "@/components/devs/DevCard";
import { SlidersHorizontal, X } from "lucide-react";

import { BrazilFlag } from "@/components/ui/BrazilFlag";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { STATES } from "@/constants/jobOptions";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { useDevs, useTechnologyOptions } from "@/hooks/useDevs";
import { getErrorMessage } from "@/utils/errors";

const PAGE_SIZE = 12;

export default function DevsPage() {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const urlCity = params.get("city") ?? "";
  const state = params.get("state") ?? "";
  const technologyId = params.get("technology_id") ?? "";
  const patriotOnly = params.get("is_patriot") === "true";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [q, setQ] = useState(urlQ);
  const [city, setCity] = useState(urlCity);
  const dq = useDebounce(q);
  const dCity = useDebounce(city);

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
  useEffect(() => {
    if (dCity !== urlCity) update({ city: dCity });
  }, [dCity]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActive = Boolean(urlQ || urlCity || state || technologyId || patriotOnly);
  const clear = () => {
    setQ("");
    setCity("");
    setParams({}, { replace: true });
  };

  const { status } = useAuth();
  const technologies = useTechnologyOptions(status === "authenticated");
  const { data, isPending, isError, error, refetch, isFetching } = useDevs({
    q: urlQ,
    city: urlCity,
    state,
    technology_id: technologyId,
    is_patriot: patriotOnly || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <PageHeader
        label="Devs"
        title="Encontre profissionais"
        description="Perfis de devs de todo o Brasil. Filtre por tecnologia, localização e veja quem apoia a rede."
        aside={
          <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400" aria-live="polite">
            {data ? (
              <>
                <span className="font-bold text-white">{data.total}</span> {data.total === 1 ? "profissional" : "profissionais"}
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
          {hasActive && (
            <button type="button" onClick={clear} className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-white">
              <X className="size-4" aria-hidden /> Limpar filtros
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Buscar" className="sm:col-span-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, usuário ou título" />
          </Field>
          {status === "authenticated" && (
            <Field label="Tecnologia">
              <Select value={technologyId} onChange={(e) => update({ technology_id: e.target.value })}>
                <option value="">Todas</option>
                {(technologies.data ?? []).map((technology) => (
                  <option key={technology.technology_id} value={technology.technology_id}>
                    {technology.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
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
          <Field label="Cidade">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Salvador" />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <ToggleChip active={patriotOnly} tone="patriot" onClick={() => update({ is_patriot: patriotOnly ? undefined : "true" })}>
            <BrazilFlag className="h-4 w-auto" /> Só patriotas
          </ToggleChip>
        </div>
      </Panel>

      <section className="mt-6" aria-busy={isFetching}>
        {isPending && !isError && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhum profissional encontrado">Ajuste os filtros e tente de novo.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((dev) => (
                <DevCard key={dev.dev_id} dev={dev} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(next) => update({ page: String(next) }, true)} />
          </>
        )}
      </section>
    </div>
  );
}