import { api } from "@/lib/api";
import type { Job, JobFilters, JobPage } from "@/types/job";

/** Remove vazios para não mandar `?state=&city=` (a API valida enums). */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Partial<T>;
}

export const jobService = {
  async list(filters: JobFilters = {}): Promise<JobPage> {
    const { data } = await api.get<JobPage>("/jobs/", { params: cleanParams(filters) });
    return data;
  },

  async get(jobId: string): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${jobId}`);
    return data;
  },
};
