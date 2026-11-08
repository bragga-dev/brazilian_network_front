import { api } from "@/lib/api";
import { tokenStore } from "@/lib/tokenStore";
import type {
  AccessToken,
  ChangePasswordInput,
  Consent,
  ConsentUpdateInput,
  GoogleLoginInput,
  LoginInput,
  Me,
  PasswordResetConfirmInput,
  RegisterInput,
  Session,
} from "@/types/auth";
import type { MessageOut } from "@/types/common";

export const authService = {
  async login(input: LoginInput): Promise<void> {
    const { data } = await api.post<AccessToken>("/auth/login", input);
    tokenStore.set(data.access);
  },

  /** Recebe o credential (id_token) do Google Identity Services. 201 = conta nova criada, 200 = login. */
  async loginWithGoogle(input: GoogleLoginInput): Promise<{ created: boolean }> {
    const { data, status } = await api.post<AccessToken>("/auth/google", input);
    tokenStore.set(data.access);
    return { created: status === 201 };
  },

  /** Cadastra e dispara o e-mail de verificação. Não mantém sessão: o login exige e-mail verificado. */
  async register(input: RegisterInput): Promise<void> {
    await api.post<AccessToken>("/auth/register", input);
    tokenStore.clear();
  },

  async logout(): Promise<void> {
    try {
      await api.post<MessageOut>("/auth/logout");
    } finally {
      tokenStore.clear();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post<MessageOut>("/auth/logout-all");
    } finally {
      tokenStore.clear();
    }
  },

  async me(): Promise<Me> {
    const { data } = await api.get<Me>("/auth/me");
    return data;
  },

  async resendVerification(email: string): Promise<MessageOut> {
    const { data } = await api.post<MessageOut>("/auth/resend-verification", null, { params: { email } });
    return data;
  },

  async requestPasswordReset(email: string): Promise<MessageOut> {
    const { data } = await api.post<MessageOut>("/auth/password-reset/request", { email });
    return data;
  },

  async confirmPasswordReset(input: PasswordResetConfirmInput): Promise<MessageOut> {
    const { data } = await api.post<MessageOut>("/auth/password-reset/confirm", input);
    return data;
  },

  /** Invalida os tokens antigos; o backend devolve um access novo (e rotaciona o cookie do refresh). */
  async changePassword(input: ChangePasswordInput): Promise<void> {
    const { data } = await api.post<AccessToken>("/auth/change-password", input);
    tokenStore.set(data.access);
  },

  async listSessions(): Promise<Session[]> {
    const { data } = await api.get<Session[]>("/auth/sessions");
    return data;
  },

  async revokeSession(sessionId: number): Promise<MessageOut> {
    const { data } = await api.delete<MessageOut>(`/auth/sessions/${sessionId}`);
    return data;
  },

  async getConsents(): Promise<Consent> {
    const { data } = await api.get<Consent>("/auth/consents");
    return data;
  },

  async updateConsents(input: ConsentUpdateInput): Promise<Consent> {
    const { data } = await api.patch<Consent>("/auth/consents", input);
    return data;
  },

  /** LGPD: portabilidade. */
  async exportMyData(): Promise<Record<string, unknown>> {
    const { data } = await api.get<Record<string, unknown>>("/auth/export-my-data");
    return data;
  },

  /** LGPD: eliminação definitiva. Exige a senha atual. */
  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete<MessageOut>("/auth/delete-account", { data: { password } });
    } finally {
      tokenStore.clear();
    }
  },
};