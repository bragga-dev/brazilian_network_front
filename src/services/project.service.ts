import { api } from "@/lib/api";
import type { Project, ProjectFilters, ProjectPage } from "@/types/project";

import { cleanParams } from "./job.service";

export const projectService = {
  async list(filters: ProjectFilters = {}): Promise<ProjectPage> {
    const { data } = await api.get<ProjectPage>("/projects/", { params: cleanParams(filters) });
    return data;
  },

  async get(projectId: string): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${projectId}`);
    return data;
  },
};