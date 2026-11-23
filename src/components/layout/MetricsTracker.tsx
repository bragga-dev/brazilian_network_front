import { usePresencePing, useVisitTracking } from "@/hooks/useMetrics";

/** Não renderiza nada: liga o registro de visita e o heartbeat de presença. */
export function MetricsTracker() {
  useVisitTracking();
  usePresencePing();
  return null;
}