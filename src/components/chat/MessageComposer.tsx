import { Paperclip, SendHorizontal, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";
import { useSendMessage } from "@/hooks/useChat";
import { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS, MAX_MESSAGE_LENGTH, formatFileSize, validateAttachments } from "@/utils/chat";
import { getErrorMessage } from "@/utils/errors";

/** Caixa de envio: Enter envia, Shift+Enter quebra linha; até 5 anexos validados antes do upload. */
export function MessageComposer({ conversationId }: { conversationId: string }) {
  const send = useSendMessage(conversationId);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const canSend = (content.trim().length > 0 || files.length > 0) && !send.isPending;

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    const next = [...files, ...picked];
    const error = validateAttachments(next);
    setFileError(error);
    if (!error) setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  };

  const resize = () => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
  };

  const submit = () => {
    if (!canSend) return;
    send.mutate(
      { content: content.trim(), files },
      {
        onSuccess: () => {
          setContent("");
          setFiles([]);
          setFileError(null);
          requestAnimationFrame(resize);
        },
      },
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const error = fileError ?? (send.isError ? getErrorMessage(send.error) : null);

  return (
    <div className="border-t border-white/10 px-3 py-3 sm:px-5">
      {files.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label="Anexos selecionados">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-1 pl-3 pr-1.5 text-xs text-slate-300">
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-slate-500">{formatFileSize(file.size)}</span>
              <button
                type="button"
                aria-label={`Remover ${file.name}`}
                onClick={() => setFiles((current) => current.filter((_, position) => position !== index))}
                className="rounded p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mb-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileInput} type="file" multiple accept={ATTACHMENT_ACCEPT} className="hidden" onChange={(event) => addFiles(event.target.files)} />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={files.length >= MAX_ATTACHMENTS}
          aria-label="Anexar arquivo"
          className="rounded-full p-2.5 text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Paperclip className="size-5" />
        </button>
        <textarea
          ref={textarea}
          value={content}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Digite uma mensagem..."
          aria-label="Mensagem"
          onChange={(event) => {
            setContent(event.target.value);
            resize();
          }}
          onKeyDown={onKeyDown}
          className="max-h-36 min-h-11 flex-1 resize-none rounded-3xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[15px] text-white placeholder:text-slate-500 focus:border-flag-green/60 focus:outline-none"
        />
        <Button onClick={submit} disabled={!canSend} aria-label="Enviar mensagem" className="size-11 shrink-0 !rounded-full !p-0">
          <SendHorizontal className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}