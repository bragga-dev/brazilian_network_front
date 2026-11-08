import { createContext } from "react";

import type { GoogleLoginInput, LoginInput, Me } from "@/types/auth";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  status: AuthStatus;
  me: Me | null;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: (input: GoogleLoginInput) => Promise<{ created: boolean }>;
  logout: () => Promise<void>;
  /** Recarrega /auth/me (ex.: depois de trocar foto ou editar o perfil). */
  refreshMe: () => Promise<void>;
  /** Encerra a sessão só no cliente (conta excluída, logout em todos os dispositivos). */
  endSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);