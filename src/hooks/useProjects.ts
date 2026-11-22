import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { projectService } from "@/services/project.service";
import type { ProjectFilters } from "@/types/project";

export const projectKeys = {
  all: ["projects"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.all, "list", filters] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ""),
    queryFn: () => projectService.get(projectId as string),
    enabled: Boolean(projectId),
  });
}