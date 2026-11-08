import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { JobFilters, JobOrder } from "@/types/job";

export const JOBS_PAGE_SIZE = 10;
const FILTER_KEYS = ["q", "contract_type", "work_model", "experience_level", "state", "city", "salary_min", "order_by"];

/** Filtros da listagem de vagas ficam na URL (compartilháveis, voltam no "voltar" do navegador). */
export function useJobFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<JobFilters>(
    () => ({
      q: params.get("q") ?? "",
      contract_type: (params.get("contract_type") ?? "") as JobFilters["contract_type"],
      work_model: (params.get("work_model") ?? "") as JobFilters["work_model"],
      experience_level: (params.get("experience_level") ?? "") as JobFilters["experience_level"],
      state: params.get("state") ?? "",
      city: params.get("city") ?? "",
      salary_min: params.get("salary_min") ?? "",
      order_by: (params.get("order_by") as JobOrder | null) ?? "-published_at",
      page: Math.max(1, Number(params.get("page")) || 1),
      page_size: JOBS_PAGE_SIZE,
    }),
    [params],
  );

  const update = useCallback(
    (patch: Partial<JobFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          }
          if (!("page" in patch)) next.delete("page"); // mudou filtro → volta pra página 1
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);
  const hasActive = FILTER_KEYS.some((key) => key !== "order_by" && params.has(key));

  return { filters, update, clear, hasActive };
}
