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
  /** Só vem enquanto há pagamento a fazer (aguardando pagamento ou em atraso). */
  payment_url: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  current_period_end: string | null;
  created_at: string;
}