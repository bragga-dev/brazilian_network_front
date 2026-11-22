import { api } from "@/lib/api";
import type {
  ApplicationFilters,
  JobApplication,
  JobApplicationInput,
  JobApplicationUpdate,
  ProjectApplication,
  ProjectApplicationInput,
  ProjectApplicationUpdate,
} from "@/types/application";
import type { PageOut } from "@/types/common";

import { cleanParams } from "./job.service";

export interface ApplicationResource<T, C, U> {
  list: (filters?: ApplicationFilters) => Promise<PageOut<T>>;
  create: (input: C) => Promise<T>;
  update: (args: { id: string; data: U }) => Promise<T>;
  withdraw: (id: string) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

/** Contrato igual para vagas e projetos (rotas `/applications/jobs/` e `/applications/projects/`, só do dev logado). */
function resource<T, C, U>(base: string): ApplicationResource<T, C, U> {
  return {
    list: async (filters = {}) => (await api.get<PageOut<T>>(base, { params: cleanParams(filters) })).data,
    create: async (input) => (await api.post<T>(base, input)).data,
    update: async ({ id, data }) => (await api.patch<T>(`${base}${id}`, data)).data,
    withdraw: async (id) => (await api.post<T>(`${base}${id}/withdraw`)).data,
    remove: async (id) => {
      await api.delete(`${base}${id}`);
    },
  };
}

export const applicationService = {
  jobs: resource<JobApplication, JobApplicationInput, JobApplicationUpdate>("/applications/jobs/"),
  projects: resource<ProjectApplication, ProjectApplicationInput, ProjectApplicationUpdate>("/applications/projects/"),
};