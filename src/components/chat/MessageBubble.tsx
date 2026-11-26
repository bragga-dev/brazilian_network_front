import { CheckCheck, Check, FileText } from "lucide-react";

import type { ChatAttachment, ChatMessage } from "@/types/chat";
import { cn } from "@/utils/cn";
import { formatFileSize, formatTime } from "@/utils/chat";

function Attachment({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.file_type === "image") {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
        <img src={attachment.url} alt={attachment.original_filename} loading="lazy" className="max-h-64 rounded-lg object-cover" />
      </a>
    );
  }
  if (attachment.file_type === "video") {
    return <video src={attachment.url} controls preload="metadata" className="max-h-64 rounded-lg" aria-label={attachment.original_filename} />;
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm hover:border-white/30"
    >
      <FileText className="size-5 shrink-0 text-flag-yellow" aria-hidden />
      <span className="min-w-0">
        <span className="block truncate font-medium text-white">{attachment.original_filename}</span>
        <span className="block text-xs text-slate-400">{formatFileSize(attachment.file_size)}</span>
      </span>
    </a>
  );
}

/** Balão da conversa. Minhas mensagens à direita, com recibo de leitura; as da outra parte à esquerda. */
export function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2.5 sm:max-w-[70%]",
          mine ? "rounded-br-md border border-flag-blue/40 bg-flag-blue/15" : "rounded-bl-md border border-white/10 bg-white/[0.06]",
        )}
      >
        {message.attachments.map((attachment) => (
          <Attachment key={attachment.attachment_id} attachment={attachment} />
        ))}
        {message.content && <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{message.content}</p>}
        <p className={cn("flex items-center gap-1 text-[11px] text-slate-500", mine && "justify-end")}>
          {formatTime(message.created_at)}
          {mine &&
            (message.is_read ? (
              <CheckCheck className="size-3.5 text-flag-green" aria-label="Lida" />
            ) : (
              <Check className="size-3.5" aria-label="Enviada" />
            ))}
        </p>
      </div>
    </div>
  );
}