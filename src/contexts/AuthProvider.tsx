import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { refreshAccessToken } from "@/lib/api";
import { AUTH_EXPIRED_EVENT, tokenStore } from "@/lib/tokenStore";
import { authService } from "@/services/auth.service";
import type { GoogleLoginInput, LoginInput, Me } from "@/types/auth";

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

  const loginWithGoogle = useCallback(
    async (input: GoogleLoginInput) => {
      const result = await authService.loginWithGoogle(input);
      setSession(await authService.me());
      return result;
    },
    [setSession],
  );

  const refreshMe = useCallback(async () => {
    setSession(await authService.me());
  }, [setSession]);

  const endSession = useCallback(() => {
    tokenStore.clear();
    queryClient.clear();
    setSession(null);
  }, [queryClient, setSession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      queryClient.clear();
      setSession(null);
    }
  }, [queryClient, setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, me, login, loginWithGoogle, logout, refreshMe, endSession }),
    [status, me, login, loginWithGoogle, logout, refreshMe, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}