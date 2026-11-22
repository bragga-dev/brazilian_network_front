import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { homeService } from "@/services/home.service";
import type { HomeActivity, HomeJob, HomeRegion, HomeStats } from "@/types/home";

export const homeKeys = { all: ["home"] as const };

export interface RegionShare extends HomeRegion {
  percent: number;
}

export interface ActivityItem {
  id: string;
  kind: "job" | "project" | "company";
  title: string;
  description: string;
  at: string;
  to: string;
}

const ACTIVITY: Record<HomeActivity["type"], { kind: ActivityItem["kind"]; title: string }> = {
  job_published: { kind: "job", title: "Nova vaga publicada" },
  project_published: { kind: "project", title: "Novo projeto freelancer" },
  company_joined: { kind: "company", title: "Nova empresa na plataforma" },
};

function toActivityItem(event: HomeActivity): ActivityItem {
  const { kind, title } = ACTIVITY[event.type];
  const to = { job: `/vagas/${event.ref_id}`, project: "/projetos", company: `/empresas/${event.ref_id}` }[kind];
  return {
    id: `${event.type}-${event.ref_id}`,
    kind,
    title,
    description: kind === "company" ? event.company_name : `${event.title ?? "Sem título"} na ${event.company_name}`,
    at: event.occurred_at,
    to,
  };
}

/** Tudo que a home precisa, numa única chamada a `GET /api/home/` (cache de 60 s no servidor). */
export function useHomeData() {
  const query = useQuery({
    queryKey: homeKeys.all,
    queryFn: homeService.get,
    staleTime: 60_000,
  });
  const data = query.data;

  const regions = useMemo<RegionShare[]>(() => {
    const list = data?.regions ?? [];
    const total = list.reduce((sum, region) => sum + region.companies_count, 0);
    return list
      .map((region) => ({ ...region, percent: total ? (region.companies_count / total) * 100 : 0 }))
      .sort((a, b) => b.companies_count - a.companies_count);
  }, [data]);

  const activity = useMemo<ActivityItem[]>(() => (data?.recent_activity ?? []).map(toActivityItem), [data]);

  return {
    stats: data?.stats as HomeStats | undefined,
    featuredJobs: (data?.featured_jobs ?? []) as HomeJob[],
    regions,
    regionsCompanyCount: regions.reduce((sum, region) => sum + region.companies_count, 0),
    activity,
    loading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}