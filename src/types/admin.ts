import type { CompanyProfile, DevProfile, User, UserRole } from "./auth";

/* ── Usuários ─────────────────────────────────────────────────────────────── */

export interface AdminUser {
  user_id: string;
  email: string;
  role: UserRole;
  role_label: string | null;
  is_trusty: boolean;
  is_active: boolean;
  date_joined: string;
  created_at: string;
  display_name: string | null;
  photo_url: string | null;
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole | "";
  is_active?: "true" | "false" | "";
  page?: number;
  page_size?: number;
}

export interface AdminUserDetail {
  user: User;
  dev: DevProfile | null;
  company: CompanyProfile | null;
  admin: { admin_id?: string; full_name?: string | null; photo_url?: string | null } | null;
}

/* ── Contatos ─────────────────────────────────────────────────────────────── */

export type ContactStatus = "pending" | "in_progress" | "resolved" | "archived";

export interface AdminContact {
  contact_id: string;
  full_name: string;
  subject: string;
  message: string;
  email: string;
  phone: string;
  status: ContactStatus;
  status_label: string;
  created_at: string;
}

export interface AdminContactFilters {
  status?: ContactStatus | "";
  search?: string;
  page?: number;
  page_size?: number;
}

/* ── Avaliações denunciadas ───────────────────────────────────────────────── */

export interface ReviewParty {
  kind: "dev" | "company";
  id: string;
  full_name: string;
  photo_url: string | null;
}

export interface AdminReview {
  review_id: string;
  direction: "company_to_dev" | "dev_to_company";
  reviewer: ReviewParty | null;
  technical_quality: number | null;
  scope_clarity: number | null;
  communication: number;
  commitment: number;
  professionalism: number;
  rating: string | number;
  comment: string | null;
  created_at: string;
  comment_hidden: boolean;
  revealed: boolean;
  report_count: number;
  reports: { reason: string; created_at: string }[];
}

/* ── Campanhas ────────────────────────────────────────────────────────────── */

export interface AdminCampaign {
  campaign_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignInput {
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

export interface CampaignImage {
  campaign_mage_id: string; // sic: o back grafa assim
  campaign_id: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
  fit: "cover" | "contain" | string;
  focus_x: number;
  focus_y: number;
  zoom: number;
  title: string;
  subtitle: string;
}

export interface CampaignImageUpdate {
  display_order?: number;
  fit?: "cover" | "contain";
  title?: string;
  subtitle?: string;
}