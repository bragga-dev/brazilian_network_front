import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { applicationService, type ApplicationResource } from "@/services/application.service";
import type { ApplicationFilters, ApplicationKind, ApplicationRef } from "@/types/application";

export const applicationKeys = {
  all: ["applications"] as const,
  list: (kind: ApplicationKind, filters: ApplicationFilters) => [...applicationKeys.all, kind, "list", filters] as const,
  index: (kind: ApplicationKind) => [...applicationKeys.all, kind, "index"] as const,
};

export function useMyJobApplications(filters: ApplicationFilters) {
  return useQuery({
    queryKey: applicationKeys.list("job", filters),
    queryFn: () => applicationService.jobs.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useMyProjectApplications(filters: ApplicationFilters) {
  return useQuery({
    queryKey: applicationKeys.list("project", filters),
    queryFn: () => applicationService.projects.list(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * Mapa vaga/projeto -> candidatura do dev logado (as 100 mais recentes; é o máximo por página do backend).
 * O backend não filtra por vaga; se passar disso, o 409 do POST ainda protege contra duplicata.
 */
export function useMyApplicationIndex(kind: ApplicationKind, enabled: boolean) {
  return useQuery({
    queryKey: applicationKeys.index(kind),
    enabled,
    queryFn: async () => {
      const map = new Map<string, ApplicationRef>();
      if (kind === "job") {
        const page = await applicationService.jobs.list({ page_size: 100 });
        for (const item of page.items) map.set(item.job_id, { id: item.send_job_application_id, status: item.status, status_label: item.status_label });
      } else {
        const page = await applicationService.projects.list({ page_size: 100 });
        for (const item of page.items) map.set(item.project_id, { id: item.send_project_application_id, status: item.status, status_label: item.status_label });
      }
      return map;
    },
  });
}

/** Qualquer mutação recarrega listas e o índice (status, botão de candidatar nas páginas de vaga/projeto). */
export function useApplicationMutations<T, C, U>(resource: ApplicationResource<T, C, U>) {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: applicationKeys.all });
  return {
    create: useMutation({ mutationFn: resource.create, onSuccess }),
    update: useMutation({ mutationFn: resource.update, onSuccess }),
    withdraw: useMutation({ mutationFn: resource.withdraw, onSuccess }),
    remove: useMutation({ mutationFn: resource.remove, onSuccess }),
  };
}

export const useJobApplicationMutations = () => useApplicationMutations(applicationService.jobs);
export const useProjectApplicationMutations = () => useApplicationMutations(applicationService.projects);