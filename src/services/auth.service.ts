import { api } from "@/lib/api";
import { tokenStore } from "@/lib/tokenStore";
import type {
  AccessToken,
  LoginInput,
  Me,
  PasswordResetConfirmInput,
  RegisterInput,
} from "@/types/auth";
import type { MessageOut } from "@/types/common";

export const authService = {
  async login(input: LoginInput): Promise<void> {
    const { data } = await api.post<AccessToken>("/auth/login", input);
    tokenStore.set(data.access);
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
};
