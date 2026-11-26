import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { refreshAccessToken } from "@/lib/api";
import { CLOSE_NOT_FOUND, CLOSE_UNAUTHENTICATED, chatSocketUrl } from "@/lib/chatSocket";
import { tokenStore } from "@/lib/tokenStore";
import type { ChatSocketEvent } from "@/types/chat";

import { appendMessage, chatKeys, markMessagesRead } from "./useChat";

export type SocketState = "connecting" | "open" | "reconnecting";

const MAX_BACKOFF_MS = 15_000;

/**
 * Mantém o WebSocket da conversa aberta: mensagens da outra parte entram no cache na hora e o recibo de
 * leitura marca as minhas como lidas. O envio vai pela API REST (um caminho só, com erro e anexos).
 * Reconecta com recuo exponencial; token expirado (4401) é renovado antes de tentar de novo.
 */
export function useChatSocket(conversationId: string, myUserId: string): SocketState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SocketState>("connecting");
  const connectedBefore = useRef(false);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    let attempts = 0;
    let disposed = false;

    const refreshConversations = () => void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, "conversations"] });

    const handle = (event: ChatSocketEvent) => {
      if (event.type === "message") {
        appendMessage(queryClient, event.message);
        refreshConversations();
      } else if (event.type === "read" && event.reader_id !== myUserId) {
        markMessagesRead(queryClient, conversationId, (senderId) => senderId === myUserId);
      }
    };

    const scheduleRetry = () => {
      attempts += 1;
      setState("reconnecting");
      retryTimer = window.setTimeout(connect, Math.min(1000 * 2 ** attempts, MAX_BACKOFF_MS));
    };

    function connect() {
      const token = tokenStore.get();
      if (disposed || !token) return;
      socket = new WebSocket(chatSocketUrl(conversationId, token));

      socket.onopen = () => {
        attempts = 0;
        setState("open");
        // Voltou depois de uma queda: busca o que passou enquanto estava fora.
        if (connectedBefore.current) void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
        connectedBefore.current = true;
      };

      socket.onmessage = (message) => {
        try {
          handle(JSON.parse(message.data as string) as ChatSocketEvent);
        } catch {
          // Quadro fora do protocolo: ignora.
        }
      };

      socket.onclose = (event) => {
        if (disposed || event.code === CLOSE_NOT_FOUND) return;
        if (event.code === CLOSE_UNAUTHENTICATED) {
          refreshAccessToken().then(connect, () => undefined); // sessão perdida: o api.ts já avisa o app
          return;
        }
        scheduleRetry();
      };
    }

    connect();
    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      socket?.close();
    };
  }, [conversationId, myUserId, queryClient]);

  return state;
}