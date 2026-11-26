import type { ApplicationKind, ApplicationStatus } from "./application";

export interface ChatParticipant {
  /** Id do perfil (dev_id ou company_id), não do usuário. */
  id: string;
  name: string;
  /** Só vem se o back já mandar; sem ele o front busca a foto no perfil público (useChatPeer). */
  photo_url?: string | null;
  is_patriot?: boolean;
}

export interface Conversation {
  conversation_id: string;
  application_kind: ApplicationKind;
  application_id: string;
  application_status: ApplicationStatus;
  opportunity_title: string;
  company: ChatParticipant;
  dev: ChatParticipant;
  /** false quando a candidatura foi recusada ou retirada: o histórico segue legível. */
  can_send: boolean;
  unread_count: number;
  last_message_at: string | null;
  created_at: string;
}

export type AttachmentType = "image" | "video" | "document";

export interface ChatAttachment {
  attachment_id: string;
  file_type: AttachmentType;
  original_filename: string;
  file_size: number;
  /** URL assinada (expira): sempre use a que veio da última consulta. */
  url: string;
}

export interface ChatMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
  attachments: ChatAttachment[];
}

export interface StartConversationInput {
  application_kind: ApplicationKind;
  application_id: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  files: File[];
}

/** Eventos do WebSocket (servidor -> cliente). */
export type ChatSocketEvent =
  | { type: "message"; message: ChatMessage }
  | { type: "read"; reader_id: string }
  | { type: "error"; detail: string };