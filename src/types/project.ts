import type { PageOut } from "./common";
import type { ExperienceLevel, JobCompany, JobTechnology } from "./job";
import type { WorkArea } from "./technology";

export type ProjectOrder = "-published_at" | "-max_value";

export interface Project {
  project_id: string;
  title: string;
  /** null quando `locked`. */
  description: string | null;
  requirements: string | null;
  experience_level: ExperienceLevel;
  experience_level_label: string;
  // Decimal serializado como string; null quando a empresa oculta o valor
  min_value: string | null;
  max_value: string | null;
  value_visible: boolean;
  estimated_duration_days: number | null;
  published_at: string | null;
  expires_at: string | null;
  technologies: JobTechnology[];
  areas: WorkArea[];
  company: JobCompany;
  /** true = só o cartão; descrição, requisitos, valor e prazo vêm nulos. */
  locked: boolean;
}

export interface ProjectFilters {
  q?: string;
  experience_level?: ExperienceLevel | "";
  technology_id?: string;
  area_id?: string;
  value_min?: string;
  company_id?: string;
  order_by?: ProjectOrder;
  page?: number;
  page_size?: number;
}

export type ProjectPage = PageOut<Project>;