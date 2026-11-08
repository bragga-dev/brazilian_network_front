export type UserRole = "admin" | "dev" | "company";
export type RegisterRole = "dev" | "company";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  role_label: string | null;
  is_trusty: boolean;
  is_active: boolean;
  is_patriot?: boolean;
  date_joined: string;
  created_at: string;
}

export interface DevProfile {
  dev_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  photo_url: string | null;
}

export interface CompanyProfile {
  company_id: string;
  full_name: string | null;
  photo_url: string | null;
}

export interface Me {
  user: User;
  dev: DevProfile | null;
  company: CompanyProfile | null;
  admin: { full_name?: string | null } | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  role: RegisterRole;
  email: string;
  password: string;
  password2: string;
  accepted_terms: boolean;
  marketing_opt_in: boolean;
}

export interface PasswordResetConfirmInput {
  uid: string;
  token: string;
  new_password: string;
  new_password2: string;
}

export interface AccessToken {
  access: string;
}

export interface GoogleLoginInput {
  id_token: string;
  role: RegisterRole;
  accepted_terms: boolean;
  marketing_opt_in: boolean;
}

export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface Session {
  id: number;
  created_at: string | null;
  expires_at: string;
  device: string | null;
}

export interface Consent {
  terms_accepted: boolean;
  terms_version_accepted: string;
  privacy_version_accepted: string;
  terms_accepted_at: string | null;
  current_terms_version: string;
  current_privacy_version: string;
  needs_reacceptance: boolean;
  marketing_opt_in: boolean;
  marketing_opt_in_at: string | null;
}

export interface ConsentUpdateInput {
  accepted_terms?: true;
  marketing_opt_in?: boolean;
}