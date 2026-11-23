import { api } from "@/lib/api";
import type { PublicMetrics } from "@/types/metrics";

export const metricsService = {
  async publicMetrics(): Promise<PublicMetrics> {
    return (await api.get<PublicMetrics>("/metrics/public")).data;
  },
  /** Heartbeat do usuário logado (alimenta "online agora"). */
  async ping(): Promise<void> {
    await api.post("/metrics/ping");
  },
  /** Conta o visitante único do dia. O id é gerado no navegador; o backend não guarda IP. */
  async visit(visitorId: string): Promise<void> {
    await api.post("/metrics/visit", { visitor_id: visitorId });
  },
};