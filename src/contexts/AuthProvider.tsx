import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { refreshAccessToken } from "@/lib/api";
import { AUTH_EXPIRED_EVENT, tokenStore } from "@/lib/tokenStore";
import { authService } from "@/services/auth.service";
import type { GoogleLoginInput, LoginInput, Me } from "@/types/auth";
import { getStatus } from "@/utils/errors";

import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

const RESTRICTED_KEYS = ["jobs", "projects", "companies"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Restaura a sessão pelo cookie de refresh. O refresh é compartilhado (single-flight), então o
 * double-mount do StrictMode não rotaciona o token duas vezes.
 * Só 401/403/404 em /auth/me significam "sem sessão". Falha passageira (429, 5xx, rede) tenta de novo
 * antes de desistir, para um limite de requisições não deslogar quem tem cookie válido.
 */
async function restoreSession(isActive: () => boolean): Promise<Me | null> {
  try {
    await refreshAccessToken();
  } catch {
    return null;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await authService.me();
    } catch (error) {
      const status = getStatus(error);
      if (status === 401 || status === 403 || status === 404) return null;
      if (attempt === 2 || !isActive()) return null;
      await wait(status === 429 ? 2000 * (attempt + 1) : 800 * (attempt + 1));
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [me, setMe] = useState<Me | null>(null);

  const setSession = useCallback(
    (value: Me | null) => {
      setMe(value);
      setStatus(value ? "authenticated" : "anonymous");
      // Vagas e projetos vêm "locked" para visitante: ao logar, o que está em cache precisa ser buscado de novo.
      if (value) void queryClient.invalidateQueries({ predicate: (query) => RESTRICTED_KEYS.includes(String(query.queryKey[0])) });
    },
    [queryClient],
  );

  useEffect(() => {
    let active = true;
    void restoreSession(() => active).then((value) => active && setSession(value));
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

  /** Nunca rejeita: se o servidor não responder, a sessão local termina do mesmo jeito. */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // o cookie de refresh expira sozinho; o importante é encerrar aqui
    } finally {
      tokenStore.clear();
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