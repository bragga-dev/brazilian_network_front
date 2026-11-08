import { useMemo } from "react";

import { REGIONS, STATE_REGION, type Region } from "@/constants/regions";

import { useCompanies } from "./useCompanies";
import { useJobs } from "./useJobs";
import { useProjects } from "./useProjects";

const REGION_SAMPLE_SIZE = 100; // PAGE_SIZE_MAX do backend

export interface RegionShare {
  region: Region;
  count: number;
  percent: number;
}

export interface ActivityItem {
  id: string;
  kind: "job" | "project";
  title: string;
  description: string;
  at: string;
  to: string;
}

/** Tudo que a home precisa, montado só com endpoints públicos que já existem. */
export function useHomeData() {
  const jobs = useJobs({ page_size: 5 });
  const projects = useProjects({ page_size: 5 });
  const companies = useCompanies({ page_size: REGION_SAMPLE_SIZE });
  const hiring = useCompanies({ has_open_jobs: true, page_size: 1 });

  const regions = useMemo<RegionShare[]>(() => {
    const counts = new Map<Region, number>(REGIONS.map((region) => [region, 0]));
    for (const company of companies.data?.items ?? []) {
      const region = company.state ? STATE_REGION[company.state] : undefined;
      if (region) counts.set(region, (counts.get(region) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
    return REGIONS.map((region) => {
      const count = counts.get(region) ?? 0;
      return { region, count, percent: total ? (count / total) * 100 : 0 };
    }).sort((a, b) => b.count - a.count);
  }, [companies.data]);

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    for (const job of jobs.data?.items ?? []) {
      if (!job.published_at) continue;
      items.push({
        id: `job-${job.job_id}`,
        kind: "job",
        title: "Nova vaga publicada",
        description: `${job.title} na ${job.company.full_name}`,
        at: job.published_at,
        to: `/vagas/${job.job_id}`,
      });
    }
    for (const project of projects.data?.items ?? []) {
      if (!project.published_at) continue;
      items.push({
        id: `project-${project.project_id}`,
        kind: "project",
        title: "Novo projeto freelancer",
        description: `${project.title} na ${project.company.full_name}`,
        at: project.published_at,
        to: "/projetos",
      });
    }
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 5);
  }, [jobs.data, projects.data]);

  return {
    featuredJobs: (jobs.data?.items ?? []).slice(0, 3),
    jobsLoading: jobs.isLoading,
    activity,
    activityLoading: jobs.isLoading || projects.isLoading,
    regions,
    regionsCompanyCount: companies.data?.items.filter((c) => c.state && STATE_REGION[c.state]).length ?? 0,
    regionsSampled: (companies.data?.total ?? 0) > REGION_SAMPLE_SIZE,
    regionsLoading: companies.isLoading,
    stats: {
      jobs: jobs.data?.total,
      companies: companies.data?.total,
      hiring: hiring.data?.total,
      projects: projects.data?.total,
    },
  };
}