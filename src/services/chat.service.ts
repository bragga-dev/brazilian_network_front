import { api } from "@/lib/api";
import type { ChatMessage, Conversation, SendMessageInput, StartConversationInput } from "@/types/chat";

export const chatService = {
  /** Abre (201) ou retoma (200) a conversa da candidatura; só vale para candidatura em análise ou aprovada. */
  start: async (input: StartConversationInput): Promise<Conversation> => (await api.post<Conversation>("/chat/conversations", input)).data,

  conversations: async (): Promise<Conversation[]> => (await api.get<Conversation[]>("/chat/conversations")).data,

  messages: async (conversationId: string): Promise<ChatMessage[]> => (await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`)).data,

  /** Texto e/ou até 5 anexos (multipart). O backend também transmite a mensagem pelo WebSocket. */
  send: async ({ conversationId, content, files }: SendMessageInput): Promise<ChatMessage> => {
    const form = new FormData();
    form.append("content", content);
    for (const file of files) form.append("files", file);
    return (await api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, form)).data;
  },

  markRead: async (conversationId: string): Promise<{ updated: number }> => (await api.post<{ updated: number }>(`/chat/conversations/${conversationId}/read`)).data,
};