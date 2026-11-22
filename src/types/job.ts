import type { PageOut } from "./common";
import type { Technology, WorkArea } from "./technology";

export type ContractType = "clt" | "pj" | "freelance" | "internship" | "temporary";
export type WorkModel = "remote" | "onsite" | "hybrid";
export type ExperienceLevel = "any" | "junior" | "mid" | "senior";
export type PayPeriod = "monthly" | "hourly" | "project";
export type JobOrder = "-published_at" | "-salary_max";

export interface JobTechnology {
  technology: Technology;
  is_required: boolean;
}

export interface JobCompany {
  company_id: string;
  full_name: string;
  photo_url: string | null;
  is_patriot: boolean;
}

export interface Job {
  job_id: string;
  title: string;
  /** null quando `locked` (visitante sem login/verificação). */
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  contract_type: ContractType;
  contract_type_label: string;
  work_model: WorkModel;
  work_model_label: string;
  experience_level: ExperienceLevel;
  experience_level_label: string;
  city: string | null;
  state: string | null;
  state_label: string;
  // Decimal serializado como string pela API; null quando a empresa oculta a remuneração
  salary_min: string | null;
  salary_max: string | null;
  pay_period: PayPeriod;
  pay_period_label: string;
  salary_visible: boolean;
  deadline: string | null;
  estimated_duration_days: number | null;
  published_at: string | null;
  expires_at: string | null;
  technologies: JobTechnology[];
  areas: WorkArea[];
  company: JobCompany;
  /** true = só o cartão da vaga; descrição, requisitos, benefícios, remuneração e prazos vêm nulos. */
  locked: boolean;
}

export interface JobFilters {
  q?: string;
  contract_type?: ContractType | "";
  work_model?: WorkModel | "";
  experience_level?: ExperienceLevel | "";
  state?: string;
  city?: string;
  salary_min?: string;
  technology_id?: string;
  area_id?: string;
  company_id?: string;
  order_by?: JobOrder;
  page?: number;
  page_size?: number;
}

export type JobPage = PageOut<Job>;