import type { ApplicationStatus } from "./application";
import type { PageOut } from "./common";
import type { ContractType, ExperienceLevel, Job, PayPeriod, WorkModel } from "./job";
import type { Project } from "./project";
import type { PublicDev } from "./profile";

export type JobStatus = "draft" | "published" | "paused" | "closed";
export type ProjectStatus = "draft" | "published" | "paused" | "in_progress" | "completed" | "closed";

/** Vaga na visão da empresa dona (`/jobs/mine/`): sempre completa, com status e remuneração. */
export type ManagedJob = Omit<Job, "company" | "locked" | "description"> & {
  description: string;
  company_id: string;
  status: JobStatus;
  status_label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ManagedProject = Omit<Project, "company" | "locked" | "description" | "estimated_duration_days"> & {
  description: string;
  estimated_duration_days: number;
  company_id: string;
  dev_id: string | null;
  status: ProjectStatus;
  status_label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export interface ListingFilters {
  status?: string;
  page?: number;
  page_size?: number;
}

/** Decimais seguem como string ("1500.00"); `null` limpa o campo no PATCH. */
export interface JobInput {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  contract_type: ContractType;
  work_model: WorkModel;
  experience_level: ExperienceLevel;
  city?: string;
  state?: string;
  salary_min?: string | null;
  salary_max?: string | null;
  pay_period: PayPeriod;
  salary_visible: boolean;
  deadline?: string | null;
  estimated_duration_days?: number | null;
}
export type JobUpdate = Partial<JobInput>;

export interface ProjectInput {
  title: string;
  description: string;
  requirements?: string;
  experience_level: ExperienceLevel;
  min_value?: string | null;
  max_value?: string | null;
  value_visible: boolean;
  estimated_duration_days: number;
}
export type ProjectUpdate = Partial<ProjectInput>;

export interface TechnologySelection {
  technology_id: string;
  is_required: boolean;
}

/** Candidato como a empresa o enxerga: perfil público + currículo. */
export interface ApplicantDev extends PublicDev {
  curriculum_url: string | null;
}

interface ReceivedBase {
  cover_letter: string;
  status: ApplicationStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  dev: ApplicantDev;
}

export interface ReceivedJobApplication extends ReceivedBase {
  send_job_application_id: string;
  job_id: string;
  job_title: string;
}

export interface ReceivedProjectApplication extends ReceivedBase {
  send_project_application_id: string;
  project_id: string;
  project_title: string;
  proposed_value: string;
  proposed_duration_days: number;
  description: string | null;
}

export interface ReceivedFilters {
  /** `job_id` (vagas) ou `project_id` (projetos). */
  opportunity_id?: string;
  status?: ApplicationStatus | "";
  page?: number;
  page_size?: number;
}

export type ManagedPage<T> = PageOut<T>;