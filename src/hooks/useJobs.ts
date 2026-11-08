import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { jobService } from "@/services/job.service";
import type { JobFilters } from "@/types/job";

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: JobFilters) => [...jobKeys.all, "list", filters] as const,
  detail: (id: string) => [...jobKeys.all, "detail", id] as const,
};

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? ""),
    queryFn: () => jobService.get(jobId as string),
    enabled: Boolean(jobId),
  });
}
