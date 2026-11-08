import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { AUTH_EXPIRED_EVENT, tokenStore } from "./tokenStore";
import type { AccessToken } from "@/types/auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true, // cookie do refresh (path /api/auth)
  headers: { "ngrok-skip-browser-warning": "true" },
});

// Cliente "cru" só para o refresh: sem interceptors, evita loop de 401.
const bare = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "ngrok-skip-browser-warning": "true" },
});

let refreshing: Promise<string> | null = null;

/** Renova o access token. Chamadas simultâneas compartilham a mesma requisição
 * (o refresh rotaciona: duas chamadas paralelas derrubariam a sessão). */
export function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = bare
      .post<AccessToken>("/auth/refresh")
      .then(({ data }) => {
        tokenStore.set(data.access);
        return data.access;
      })
      .catch((error) => {
        tokenStore.clear();
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/google"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall = AUTH_PATHS.some((path) => config?.url?.startsWith(path));

    if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
      return Promise.reject(error);
    }

    config._retried = true;
    try {
      const token = await refreshAccessToken();
      config.headers.set("Authorization", `Bearer ${token}`);
      return api(config);
    } catch {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      return Promise.reject(error);
    }
  },
);
