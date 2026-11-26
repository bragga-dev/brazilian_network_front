import type { ApplicationStatus } from "@/types/application";
import type { AttachmentType, ChatMessage } from "@/types/chat";

export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_ATTACHMENTS = 5;

/** Mesmas extensões e limites do validador do backend (que ainda confere o conteúdo real do arquivo). */
const EXTENSIONS: Record<AttachmentType, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  video: [".mp4", ".mov", ".webm"],
  document: [".pdf", ".txt"],
};
const MAX_SIZE_MB: Record<AttachmentType, number> = { image: 5, video: 50, document: 10 };

export const ATTACHMENT_ACCEPT = Object.values(EXTENSIONS).flat().join(",");

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pendente",
  in_review: "Em análise",
  accepted: "Aprovada",
  rejected: "Recusada",
  withdrawn: "Retirada",
};

/** Só candidatura em análise ou aprovada abre conversa nova (mesma regra do backend). */
export const canStartChat = (status: ApplicationStatus) => status === "in_review" || status === "accepted";

function typeOf(file: File): AttachmentType | null {
  const name = file.name.toLowerCase();
  const found = (Object.entries(EXTENSIONS) as [AttachmentType, string[]][]).find(([, extensions]) => extensions.some((extension) => name.endsWith(extension)));
  return found ? found[0] : null;
}

/** Devolve a mensagem de erro do primeiro arquivo inválido, ou null se a lista toda for aceitável. */
export function validateAttachments(files: File[]): string | null {
  if (files.length > MAX_ATTACHMENTS) return `Envie no máximo ${MAX_ATTACHMENTS} anexos por mensagem.`;
  for (const file of files) {
    const type = typeOf(file);
    if (!type) return `"${file.name}": formato não suportado. Use fotos, vídeos (MP4, MOV, WEBM), PDF ou TXT.`;
    if (file.size > MAX_SIZE_MB[type] * 1024 * 1024) return `"${file.name}" passa do limite de ${MAX_SIZE_MB[type]} MB para este tipo de arquivo.`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

export function dayLabel(iso: string): string {
  const day = dayKey(iso);
  if (day === dayKey(new Date().toISOString())) return "Hoje";
  if (day === dayKey(new Date(Date.now() - 86_400_000).toISOString())) return "Ontem";
  return day;
}

export interface DayGroup {
  day: string;
  label: string;
  messages: ChatMessage[];
}

/** Agrupa o histórico (já em ordem cronológica) por dia para os separadores da conversa. */
export function groupByDay(messages: ChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const message of messages) {
    const day = dayKey(message.created_at);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.messages.push(message);
    else groups.push({ day, label: dayLabel(message.created_at), messages: [message] });
  }
  return groups;
}