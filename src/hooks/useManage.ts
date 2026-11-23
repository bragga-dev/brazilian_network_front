import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { manageService } from "@/services/manage.service";
import type { ListingFilters, ReceivedFilters, TechnologySelection } from "@/types/manage";

export const manageKeys = {
  all: ["manage"] as const,
  jobs: (filters: ListingFilters) => [...manageKeys.all, "jobs", filters] as const,
  projects: (filters: ListingFilters) => [...manageKeys.all, "projects", filters] as const,
  receivedJobs: (filters: ReceivedFilters) => [...manageKeys.all, "received-jobs", filters] as const,
  receivedProjects: (filters: ReceivedFilters) => [...manageKeys.all, "received-projects", filters] as const,
};

export const useManagedJobs = (filters: ListingFilters, enabled = true) =>
  useQuery({ queryKey: manageKeys.jobs(filters), queryFn: () => manageService.jobs.list(filters), placeholderData: keepPreviousData, enabled });

export const useManagedProjects = (filters: ListingFilters, enabled = true) =>
  useQuery({ queryKey: manageKeys.projects(filters), queryFn: () => manageService.projects.list(filters), placeholderData: keepPreviousData, enabled });

export const useReceivedJobs = (filters: ReceivedFilters, enabled = true) =>
  useQuery({ queryKey: manageKeys.receivedJobs(filters), queryFn: () => manageService.receivedJobs.list(filters), placeholderData: keepPreviousData, enabled });

export const useReceivedProjects = (filters: ReceivedFilters, enabled = true) =>
  useQuery({ queryKey: manageKeys.receivedProjects(filters), queryFn: () => manageService.receivedProjects.list(filters), placeholderData: keepPreviousData, enabled });

/** Mudou vaga/projeto ou candidatura: recarrega o painel da empresa, as listagens públicas e a home. */
function useRefreshAll() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(["manage", "jobs", "projects", "companies", "home"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}

type IdAction = (id: string) => Promise<unknown>;

interface ListingApi {
  create: (input: never) => Promise<unknown>;
  update: (args: { id: string; data: never }) => Promise<unknown>;
  remove: IdAction;
  publish: IdAction;
  pause: IdAction;
  close: IdAction;
  setTechnologies: (args: { id: string; items: TechnologySelection[] }) => Promise<unknown>;
  setAreas: (args: { id: string; areaIds: string[] }) => Promise<unknown>;
}

export function useListingMutations(kind: "job" | "project") {
  const refresh = useRefreshAll();
  const api: ListingApi = kind === "job" ? manageService.jobs : manageService.projects;
  const onSuccess = () => refresh();
  return {
    create: useMutation({ mutationFn: api.create, onSuccess }),
    update: useMutation({ mutationFn: api.update, onSuccess }),
    remove: useMutation({ mutationFn: api.remove, onSuccess }),
    publish: useMutation({ mutationFn: api.publish, onSuccess }),
    pause: useMutation({ mutationFn: api.pause, onSuccess }),
    close: useMutation({ mutationFn: api.close, onSuccess }),
    complete: useMutation({ mutationFn: manageService.projects.complete, onSuccess }),
    setTechnologies: useMutation({ mutationFn: api.setTechnologies, onSuccess }),
    setAreas: useMutation({ mutationFn: api.setAreas, onSuccess }),
  };
}

export function useReceivedMutations(kind: "job" | "project") {
  const refresh = useRefreshAll();
  const api: Record<"review" | "accept" | "reject", IdAction> = kind === "job" ? manageService.receivedJobs : manageService.receivedProjects;
  const onSuccess = () => refresh();
  return {
    review: useMutation({ mutationFn: api.review, onSuccess }),
    accept: useMutation({ mutationFn: api.accept, onSuccess }),
    reject: useMutation({ mutationFn: api.reject, onSuccess }),
  };
}