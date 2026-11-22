import type { JobCompany } from "./job";

export type ApplicationStatus = "pending" | "in_review" | "accepted" | "rejected" | "withdrawn";
export type ApplicationKind = "job" | "project";

export interface JobApplication {
  send_job_application_id: string;
  job_id: string;
  job_title: string;
  cover_letter: string;
  status: ApplicationStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  company: JobCompany;
}

export interface ProjectApplication {
  send_project_application_id: string;
  project_id: string;
  project_title: string;
  cover_letter: string;
  // Decimal serializado como string pela API
  proposed_value: string;
  proposed_duration_days: number;
  description: string | null;
  status: ApplicationStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  company: JobCompany;
}

export interface JobApplicationInput {
  job_id: string;
  cover_letter?: string;
}
export interface JobApplicationUpdate {
  cover_letter?: string;
}

export interface ProjectApplicationInput {
  project_id: string;
  cover_letter?: string;
  /** Decimal como string ("1500.00"): nunca float. */
  proposed_value: string;
  proposed_duration_days: number;
  description?: string;
}
export interface ProjectApplicationUpdate {
  cover_letter?: string;
  proposed_value?: string;
  proposed_duration_days?: number;
  /** null limpa a descrição. */
  description?: string | null;
}

export interface ApplicationFilters {
  status?: ApplicationStatus | "";
  page?: number;
  page_size?: number;
}

/** Resumo para saber, na página da vaga/projeto, se o dev já se candidatou. */
export interface ApplicationRef {
  id: string;
  status: ApplicationStatus;
  status_label: string;
}