import { api } from "@/lib/api";
import type { PageOut } from "@/types/common";
import type {
  JobInput,
  JobUpdate,
  ListingFilters,
  ManagedJob,
  ManagedProject,
  ProjectInput,
  ProjectUpdate,
  ReceivedFilters,
  ReceivedJobApplication,
  ReceivedProjectApplication,
  TechnologySelection,
} from "@/types/manage";

import { cleanParams } from "./job.service";

/** CRUD + ações de status de vagas e projetos da empresa logada (`/jobs/mine/` e `/projects/mine/`). */
function listing<T, I, U>(base: string) {
  return {
    list: async (filters: ListingFilters = {}) => (await api.get<PageOut<T>>(base, { params: cleanParams(filters) })).data,
    get: async (id: string) => (await api.get<T>(`${base}${id}`)).data,
    create: async (input: I) => (await api.post<T>(base, input)).data,
    update: async ({ id, data }: { id: string; data: U }) => (await api.patch<T>(`${base}${id}`, data)).data,
    remove: async (id: string) => {
      await api.delete(`${base}${id}`);
    },
    publish: async (id: string) => (await api.post<T>(`${base}${id}/publish`)).data,
    pause: async (id: string) => (await api.post<T>(`${base}${id}/pause`)).data,
    close: async (id: string) => (await api.post<T>(`${base}${id}/close`)).data,
    setTechnologies: async ({ id, items }: { id: string; items: TechnologySelection[] }) =>
      (await api.put<T>(`${base}${id}/technologies`, { items })).data,
    setAreas: async ({ id, areaIds }: { id: string; areaIds: string[] }) => (await api.put<T>(`${base}${id}/areas`, { area_ids: areaIds })).data,
  };
}

/** Candidaturas recebidas: a empresa só move o status (em análise, aprovar, recusar). */
function received<T>(base: string, filterKey: "job_id" | "project_id") {
  return {
    list: async ({ opportunity_id, ...rest }: ReceivedFilters = {}) =>
      (await api.get<PageOut<T>>(base, { params: cleanParams({ ...rest, [filterKey]: opportunity_id }) })).data,
    review: async (id: string) => (await api.post<T>(`${base}${id}/review`)).data,
    accept: async (id: string) => (await api.post<T>(`${base}${id}/accept`)).data,
    reject: async (id: string) => (await api.post<T>(`${base}${id}/reject`)).data,
  };
}

export const manageService = {
  jobs: listing<ManagedJob, JobInput, JobUpdate>("/jobs/mine/"),
  projects: {
    ...listing<ManagedProject, ProjectInput, ProjectUpdate>("/projects/mine/"),
    /** in_progress -> completed (libera a avaliação mútua). */
    complete: async (id: string) => (await api.post<ManagedProject>(`/projects/mine/${id}/complete`)).data,
  },
  receivedJobs: received<ReceivedJobApplication>("/applications/jobs/received/", "job_id"),
  receivedProjects: received<ReceivedProjectApplication>("/applications/projects/received/", "project_id"),
};