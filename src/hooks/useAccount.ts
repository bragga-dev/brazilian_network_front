import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import type { ConsentUpdateInput } from "@/types/auth";

export const accountKeys = {
  sessions: ["account", "sessions"] as const,
  consents: ["account", "consents"] as const,
};

export function useSessions() {
  return useQuery({ queryKey: accountKeys.sessions, queryFn: authService.listSessions, staleTime: 0 });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => authService.revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.sessions }),
  });
}

export function useConsents(enabled = true) {
  return useQuery({ queryKey: accountKeys.consents, queryFn: authService.getConsents, enabled });
}

export function useUpdateConsents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConsentUpdateInput) => authService.updateConsents(input),
    onSuccess: (data) => queryClient.setQueryData(accountKeys.consents, data),
  });
}