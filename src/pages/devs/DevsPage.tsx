import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DevCard } from "@/components/devs/DevCard";
import { Field, Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
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
      <SectionLabel tone="green">Devs</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Encontre profissionais</h1>
      <p className="mt-2 text-slate-400">{data ? `${data.total} ${data.total === 1 ? "profissional encontrado" : "profissionais encontrados"}` : " "}</p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_110px_1fr] lg:items-end">
        <Field label="Buscar">
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
        <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-300">
          <input type="checkbox" checked={patriotOnly} onChange={(e) => update({ is_patriot: e.target.checked ? "true" : undefined })} className="size-4 accent-flag-green" />
          Só patriotas
        </label>
        {hasActive && (
          <button type="button" onClick={clear} className="pb-2.5 text-left text-sm text-slate-400 underline-offset-2 hover:text-white hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      <section className="mt-6" aria-busy={isFetching}>
        {isPending && !isError && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhum profissional encontrado">Ajuste os filtros e tente de novo.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
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