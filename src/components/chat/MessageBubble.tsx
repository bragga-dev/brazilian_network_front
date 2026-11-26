import { Check, CheckCheck, FileText } from "lucide-react";
import type { ReactNode } from "react";

import type { ChatAttachment, ChatMessage } from "@/types/chat";
import { cn } from "@/utils/cn";
import { formatFileSize, formatTime } from "@/utils/chat";

/** Posição da mensagem dentro de uma sequência da mesma pessoa (define os cantos arredondados). */
export type ClusterPosition = "single" | "first" | "middle" | "last";

function Attachment({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.file_type === "image") {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
        <img src={attachment.url} alt={attachment.original_filename} loading="lazy" className="max-h-72 rounded-xl object-cover" />
      </a>
    );
  }
  if (attachment.file_type === "video") {
    return <video src={attachment.url} controls preload="metadata" className="max-h-72 rounded-xl" aria-label={attachment.original_filename} />;
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm hover:border-white/30"
    >
      <FileText className="size-5 shrink-0 text-flag-yellow" aria-hidden />
      <span className="min-w-0">
        <span className="block truncate font-medium text-white">{attachment.original_filename}</span>
        <span className="block text-xs text-slate-400">{formatFileSize(attachment.file_size)}</span>
      </span>
    </a>
  );
}

const RADIUS: Record<"mine" | "theirs", Record<ClusterPosition, string>> = {
  mine: { single: "rounded-3xl", first: "rounded-3xl rounded-br-lg", middle: "rounded-3xl rounded-r-lg", last: "rounded-3xl rounded-tr-lg" },
  theirs: { single: "rounded-3xl", first: "rounded-3xl rounded-bl-lg", middle: "rounded-3xl rounded-l-lg", last: "rounded-3xl rounded-tl-lg" },
};

interface Props {
  message: ChatMessage;
  mine: boolean;
  position: ClusterPosition;
  /** Foto da outra parte, mostrada ao lado da última mensagem da sequência. */
  avatar?: ReactNode;
}

/** Balão estilo Messenger: minhas à direita (degradê), da outra parte à esquerda com foto; hora e recibo só no fim da sequência. */
export function MessageBubble({ message, mine, position, avatar }: Props) {
  const isEnd = position === "last" || position === "single";
  const hasText = Boolean(message.content);

  return (
    <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && <div className="w-8 shrink-0">{isEnd && avatar}</div>}
      <div className={cn("flex max-w-[80%] flex-col sm:max-w-[65%]", mine ? "items-end" : "items-start")}>
        {message.attachments.length > 0 && (
          <div className="mb-1 flex flex-col gap-1">
            {message.attachments.map((attachment) => (
              <Attachment key={attachment.attachment_id} attachment={attachment} />
            ))}
          </div>
        )}
        {hasText && (
          <p
            title={new Date(message.created_at).toLocaleString("pt-BR")}
            className={cn(
              "whitespace-pre-wrap break-words px-4 py-2 text-[15px] leading-snug",
              RADIUS[mine ? "mine" : "theirs"][position],
              mine ? "bg-linear-to-br from-flag-green to-teal-400 font-medium text-black" : "bg-white/[0.09] text-slate-100",
            )}
          >
            {message.content}
          </p>
        )}
        {isEnd && (
          <p className="mt-1 flex items-center gap-1 px-1 text-[11px] text-slate-500">
            {formatTime(message.created_at)}
            {mine &&
              (message.is_read ? <CheckCheck className="size-3.5 text-flag-green" aria-label="Lida" /> : <Check className="size-3.5" aria-label="Enviada" />)}
          </p>
        )}
      </div>
    </div>
  );
}