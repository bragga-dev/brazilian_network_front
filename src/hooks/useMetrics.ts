import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { metricsService } from "@/services/metrics.service";

import { useAuth } from "./useAuth";

const PING_INTERVAL_MS = 60_000;
const VISITOR_KEY = "bn:visitor-id";
const VISIT_SENT_KEY = "bn:visit-sent";

export function usePublicMetrics() {
  return useQuery({ queryKey: ["metrics", "public"], queryFn: metricsService.publicMetrics, refetchInterval: PING_INTERVAL_MS, staleTime: 30_000 });
}

/** Heartbeat enquanto o usuário está logado e a aba visível. Falha de métrica nunca aparece para o usuário. */
export function usePresencePing() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") return;
    const ping = () => {
      if (document.visibilityState === "visible") metricsService.ping().catch(() => undefined);
    };
    ping();
    const timer = window.setInterval(ping, PING_INTERVAL_MS);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [status]);
}

function getVisitorId(): string {
  try {
    const saved = localStorage.getItem(VISITOR_KEY);
    if (saved) return saved;
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID(); // storage bloqueado: conta como visitante novo
  }
}

/** Registra a visita uma vez por sessão do navegador. */
export function useVisitTracking() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(VISIT_SENT_KEY)) return;
      sessionStorage.setItem(VISIT_SENT_KEY, "1"); // antes do request: o StrictMode monta o efeito duas vezes
    } catch {
      // sem sessionStorage: segue e registra
    }
    metricsService.visit(getVisitorId()).catch(() => undefined);
  }, []);
}