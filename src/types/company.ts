import type { PageOut } from "./common";
import type { Job } from "./job";

export interface PublicCompany {
  company_id: string;
  full_name: string;
  photo_url: string | null;
  bio: string;
  github_url: string | null;
  linkedin_url: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
}

export interface PublicCompanyListItem extends PublicCompany {
  open_jobs_count: number;
}

export interface PublicCompanyProfile {
  company: PublicCompany;
  jobs: PageOut<Job>;
}

export interface CompanyFilters {
  q?: string;
  state?: string;
  city?: string;
  has_open_jobs?: boolean;
  page?: number;
  page_size?: number;
}
