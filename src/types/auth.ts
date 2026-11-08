export type UserRole = "admin" | "dev" | "company";
export type RegisterRole = "dev" | "company";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  role_label: string | null;
  is_trusty: boolean;
  is_active: boolean;
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
