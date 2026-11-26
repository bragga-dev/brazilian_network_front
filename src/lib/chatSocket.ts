/** Códigos de fechamento do consumer do backend. */
export const CLOSE_UNAUTHENTICATED = 4401;
export const CLOSE_NOT_FOUND = 4404;

/**
 * URL do WebSocket da conversa. O navegador não envia header em WebSocket, então o access token vai na query
 * (o backend valida com o mesmo JWT das rotas HTTP). A origem sai de VITE_API_URL: absoluta em dev
 * (http://localhost:8000/api) ou relativa em produção (/api, nginx faz o proxy de /ws/).
 */
export function chatSocketUrl(conversationId: string, token: string): string {
  const api = new URL(import.meta.env.VITE_API_URL ?? "http://localhost:8000/api", window.location.origin);
  const protocol = api.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${api.host}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`;
}