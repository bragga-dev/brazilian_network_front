import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { refreshAccessToken } from "@/lib/api";
import { AUTH_EXPIRED_EVENT, tokenStore } from "@/lib/tokenStore";
import { authService } from "@/services/auth.service";
import type { LoginInput, Me } from "@/types/auth";

import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [me, setMe] = useState<Me | null>(null);

  const setSession = useCallback((value: Me | null) => {
    setMe(value);
    setStatus(value ? "authenticated" : "anonymous");
  }, []);

  // Restaura a sessão pelo cookie de refresh. O refresh é compartilhado (single-flight),
  // então o double-mount do StrictMode não rotaciona o token duas vezes.
  useEffect(() => {
    let active = true;
    refreshAccessToken()
      .then(() => authService.me())
      .then((value) => active && setSession(value))
      .catch(() => active && setSession(null));
    return () => {
      active = false;
    };
  }, [setSession]);

  useEffect(() => {
    const onExpired = () => {
      tokenStore.clear();
      queryClient.clear();
      setSession(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient, setSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      await authService.login(input);
      setSession(await authService.me());
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      queryClient.clear();
      setSession(null);
    }
  }, [queryClient, setSession]);

  const value = useMemo<AuthContextValue>(() => ({ status, me, login, logout }), [status, me, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
