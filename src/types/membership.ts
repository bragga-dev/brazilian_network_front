export type MembershipStatus = "pending" | "active" | "overdue" | "cancelled";

export interface MembershipPlan {
  plan_id: string;
  name: string;
  description: string;
  value: string;
}

export interface Membership {
  membership_id: string;
  status: MembershipStatus;
  status_label: string;
  plan: MembershipPlan;
  value: string;
  /** Pix em aberto: QR Code (PNG em base64) e copia e cola. Só vêm enquanto há um Pix a pagar. */
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  pix_expires_at: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  current_period_end: string | null;
  created_at: string;
}