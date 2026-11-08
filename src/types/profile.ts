import type { DevProfile } from "./auth";
import type { PageOut } from "./common";

export type EducationLevel =
  | "elementary" | "high_school" | "technical" | "undergraduate" | "postgraduate" | "mba" | "masters" | "doctorate" | "postdoctorate";
export type ProgressStatus = "in_progress" | "completed" | "interrupted";
export type EmploymentType = "clt" | "pj" | "internship" | "freelance" | "self_employed" | "volunteer" | "temporary" | "apprentice";
export type CourseType = "free_course" | "bootcamp" | "workshop" | "certification" | "training" | "conference" | "seminar";
export type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

export interface TechnologyCategory {
  technology_category_id: string;
  name: string;
}

export interface Technology {
  technology_id: string;
  name: string;
  categories: TechnologyCategory[];
}

export interface DevTechnology {
  dev_technology_id: string;
  technology: Technology;
  proficiency: Proficiency;
  proficiency_label: string;
  years_experience: number;
  is_active: boolean;
}

export interface Education {
  education_id: string;
  institution: string;
  course: string;
  education_level: EducationLevel;
  education_level_label: string;
  status: ProgressStatus;
  status_label: string;
  start_date: string;
  end_date: string | null;
  description: string;
  is_active: boolean;
}

export interface Experience {
  experience_id: string;
  company: string;
  position: string;
  employment_type: EmploymentType;
  employment_type_label: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  is_active: boolean;
}

export interface Course {
  course_id: string;
  name: string;
  provider: string;
  course_url: string;
  course_type: CourseType;
  course_type_label: string;
  status: ProgressStatus;
  status_label: string;
  workload: number | null;
  description: string;
  start_date: string | null;
  completion_date: string | null;
  certificate_url: string;
  is_active: boolean;
}

/** DevOut (GET /profile/me): o /auth/me + accepts_patriot_discount. */
export interface MyDev extends DevProfile {
  user: { user_id: string; email: string };
  accepts_patriot_discount: boolean;
}

export interface ProfileSections {
  technologies: DevTechnology[];
  educations: Education[];
  experiences: Experience[];
  courses: Course[];
}

export interface MyProfile extends ProfileSections {
  dev: MyDev;
}

export interface PublicDev {
  dev_id: string;
  username: string | null;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  photo_url: string | null;
  bio: string;
  github_url: string | null;
  linkedin_url: string | null;
  site_url: string | null;
  is_patriot: boolean;
  accepts_patriot_discount: boolean;
}

export interface PublicProfile extends ProfileSections {
  dev: PublicDev;
}

export interface Address {
  address_id: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  state_label: string;
  country: string;
  is_preferential: boolean;
}

export interface AddressInput {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
}

export type AddressOwner = "dev" | "company";

export interface DevUpdateInput {
  username?: string;
  first_name?: string;
  last_name?: string;
  headline?: string;
  whatsapp?: string;
  gender?: string;
  birth_date?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  site_url?: string;
  accepts_patriot_discount?: boolean;
}

export interface CompanyUpdateInput {
  full_name?: string;
  legal_name?: string;
  cnpj?: string;
  whatsapp?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  website?: string;
}

export interface EducationInput {
  institution: string;
  course: string;
  education_level: EducationLevel;
  status: ProgressStatus;
  start_date: string;
  end_date?: string;
  description?: string;
}
export type EducationUpdate = Partial<EducationInput> & { is_active?: boolean };

export interface ExperienceInput {
  company: string;
  position: string;
  employment_type: EmploymentType;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}
export type ExperienceUpdate = Partial<ExperienceInput> & { is_active?: boolean };

export interface CourseInput {
  name: string;
  provider: string;
  course_type: CourseType;
  status: ProgressStatus;
  course_url?: string;
  workload?: number;
  description?: string;
  start_date?: string;
  completion_date?: string;
  certificate_url?: string;
}
export type CourseUpdate = Partial<CourseInput> & { is_active?: boolean };

export interface DevTechnologyInput {
  technology_id: string;
  proficiency: Proficiency;
  years_experience: number;
}
export type DevTechnologyUpdate = { proficiency?: Proficiency; years_experience?: number; is_active?: boolean };

export type TechnologyPage = PageOut<Technology>;