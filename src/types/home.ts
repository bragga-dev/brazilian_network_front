import type { ContractType, ExperienceLevel, PayPeriod, WorkModel } from "./job";

export type RegionKey = "norte" | "nordeste" | "centro_oeste" | "sudeste" | "sul";

export interface HomeStats {
  devs: number;
  companies: number;
  open_jobs: number;
  open_projects: number;
}

export interface HomeCompany {
  company_id: string;
  full_name: string;
  photo_url: string | null;
  is_patriot: boolean;
  city: string | null;
  state: string | null;
  open_jobs_count: number;
}

export interface HomeRegion {
  region: RegionKey;
  label: string;
  states: string[];
  companies_count: number;
  open_jobs_count: number;
  companies: HomeCompany[];
}

/** Cartão enxuto: a home é pública e vem em cache, então não traz descrição nem remuneração. */
export interface HomeJob {
  job_id: string;
  title: string;
  company: { company_id: string; full_name: string; photo_url: string | null; is_patriot: boolean };
  contract_type: ContractType;
  contract_type_label: string;
  work_model: WorkModel;
  work_model_label: string;
  experience_level: ExperienceLevel;
  experience_level_label: string;
  city: string | null;
  state: string | null;
  pay_period: PayPeriod;
  pay_period_label: string;
  published_at: string | null;
  technologies: string[];
}

export type HomeActivityType = "job_published" | "project_published" | "company_joined";

export interface HomeActivity {
  type: HomeActivityType;
  ref_id: string;
  title: string | null;
  company_id: string;
  company_name: string;
  occurred_at: string;
}

export interface HomeData {
  stats: HomeStats;
  regions: HomeRegion[];
  featured_jobs: HomeJob[];
  recent_activity: HomeActivity[];
}