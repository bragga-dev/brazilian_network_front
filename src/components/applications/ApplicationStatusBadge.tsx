import { Badge } from "@/components/ui/Badge";
import type { ApplicationStatus } from "@/types/application";

const TONES = {
  pending: "yellow",
  in_review: "blue",
  accepted: "green",
  rejected: "red",
  withdrawn: "neutral",
} as const satisfies Record<ApplicationStatus, string>;

export function ApplicationStatusBadge({ status, label }: { status: ApplicationStatus; label: string }) {
  return <Badge tone={TONES[status]}>{label}</Badge>;
}