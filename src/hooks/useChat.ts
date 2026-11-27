import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { chatService } from "@/services/chat.service";
import type { ChatMessage, Conversation } from "@/types/chat";

import { useAuth } from "./useAuth";

const ROOT = ["chat"] as const;

export const chatKeys = {
  all: ROOT,
  conversations: (userId: string | undefined) => [...ROOT, "conversations", userId] as const,
  messages: (conversationId: string) => [...ROOT, "messages", conversationId] as const,
};

/** Chat é só de dev e empresa verificados (mesma regra do backend, que devolve 403 para o resto). */
export function useChatEligible(): boolean {
  const { me } = useAuth();
  return Boolean(me && (me.user.role === "dev" || me.user.role === "company") && me.user.is_active && me.user.is_trusty);
}

/** Minhas conversas. `refetchInterval` mantém a lista e o contador de não lidas em dia (não há canal global no WebSocket). */
export function useConversations(refetchInterval: number | false = false) {
  const { me } = useAuth();
  const eligible = useChatEligible();
  return useQuery({
    queryKey: chatKeys.conversations(me?.user.user_id),
    queryFn: chatService.conversations,
    enabled: eligible,
    staleTime: 0,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}

/** Total de mensagens não lidas, para o ícone do cabeçalho. */
export function useUnreadMessages(): number {
  const { data } = useConversations(15_000);
  return data?.reduce((total, conversation) => total + conversation.unread_count, 0) ?? 0;
}

/** `refetchInterval`: fallback de polling para quando o WebSocket não está aberto (senão a conversa parece parada). */
export function useMessages(conversationId: string, refetchInterval: number | false = false) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => chatService.messages(conversationId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval,
  });
}

/** Acrescenta ao histórico em cache sem duplicar (a mesma mensagem chega pela resposta do envio e pelo WebSocket). */
export function appendMessage(queryClient: QueryClient, message: ChatMessage): void {
  queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(message.conversation_id), (current) => {
    if (!current || current.some((item) => item.message_id === message.message_id)) return current;
    return [...current, message];
  });
}

/** Marca como lidas, no cache, as mensagens de um lado da conversa (`sender`: quem escreveu). */
export function markMessagesRead(queryClient: QueryClient, conversationId: string, senderIs: (senderId: string) => boolean): void {
  queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (current) =>
    current?.map((message) => (!message.is_read && senderIs(message.sender_id) ? { ...message, is_read: true } : message)),
  );
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.start,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...chatKeys.all, "conversations"] }),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { content: string; files: File[] }) => chatService.send({ conversationId, ...input }),
    onSuccess: (message) => {
      appendMessage(queryClient, message);
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, "conversations"] });
    },
  });
}

export function useMarkRead(myUserId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.markRead,
    onSuccess: (_result, conversationId) => {
      markMessagesRead(queryClient, conversationId, (senderId) => senderId !== myUserId);
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations(myUserId), (current) =>
        current?.map((conversation) => (conversation.conversation_id === conversationId ? { ...conversation, unread_count: 0 } : conversation)),
      );
    },
  });
}