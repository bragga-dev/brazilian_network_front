import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { Field, Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { EXPERIENCE_OPTIONS } from "@/constants/jobOptions";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjects } from "@/hooks/useProjects";
import type { ExperienceLevel } from "@/types/job";
import type { ProjectOrder } from "@/types/project";
import { getErrorMessage } from "@/utils/errors";

const ORDER_OPTIONS: { value: ProjectOrder; label: string }[] = [
  { value: "-published_at", label: "Mais recentes" },
  { value: "-max_value", label: "Maior valor" },
];

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const level = (params.get("experience_level") ?? "") as ExperienceLevel | "";
  const order = (params.get("order_by") as ProjectOrder | null) ?? "-published_at";
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

  const { data, isLoading, isError, error, refetch, isFetching } = useProjects({
    q: urlQ,
    experience_level: level,
    order_by: order,
    page,
    page_size: 10,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel tone="blue">Projetos</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Projetos freelancer</h1>
      <p className="mt-2 text-slate-400">{data ? `${data.total} ${data.total === 1 ? "projeto aberto" : "projetos abertos"}` : " "}</p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[1fr_180px_180px] sm:items-end">
        <Field label="Buscar projeto">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título ou descrição" />
        </Field>
        <Field label="Nível">
          <Select value={level} onChange={(e) => update({ experience_level: e.target.value })}>
            <option value="">Todos</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ordenar por">
          <Select value={order} onChange={(e) => update({ order_by: e.target.value })}>
            {ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <section className="mt-6" aria-busy={isFetching}>
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhum projeto encontrado">Ajuste os filtros e tente de novo.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 md:grid-cols-2 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((project) => (
                <ProjectCard key={project.project_id} project={project} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(next) => update({ page: String(next) }, true)} />
          </>
        )}
      </section>
    </div>
  );
}