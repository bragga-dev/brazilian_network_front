import { ArrowLeft, Lock } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useMarkRead, useMessages } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { Conversation } from "@/types/chat";
import { STATUS_LABEL, groupByDay } from "@/utils/chat";
import { getErrorMessage } from "@/utils/errors";

interface Props {
  conversation: Conversation;
  myUserId: string;
  /** Quem está logado: define quem é "a outra parte" e para onde o nome dela aponta. */
  role: "dev" | "company";
}

const NEAR_BOTTOM_PX = 96;

export function ChatThread({ conversation, myUserId, role }: Props) {
  const { conversation_id: conversationId } = conversation;
  const other = role === "dev" ? conversation.company : conversation.dev;
  const otherTo = role === "dev" ? `/empresas/${other.id}` : `/devs/${other.id}`;

  const { data: messages, isLoading, isError, error, refetch } = useMessages(conversationId);
  const socket = useChatSocket(conversationId, myUserId);
  const { mutate: markRead } = useMarkRead(myUserId);

  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const unreadIncoming = useMemo(() => messages?.filter((message) => !message.is_read && message.sender_id !== myUserId).length ?? 0, [messages, myUserId]);
  const groups = useMemo(() => groupByDay(messages ?? []), [messages]);
  const lastMessage = messages?.[messages.length - 1];

  // Conversa aberta com mensagens da outra parte pendentes: marca como lidas (e zera o contador).
  useEffect(() => {
    if (unreadIncoming > 0) markRead(conversationId);
  }, [unreadIncoming, conversationId, markRead]);

  // Acompanha o fim da conversa, a menos que a pessoa tenha subido para reler algo (suas próprias mensagens sempre descem).
  useLayoutEffect(() => {
    const element = listRef.current;
    if (!element || !lastMessage) return;
    if (stickToBottom.current || lastMessage.sender_id === myUserId) element.scrollTop = element.scrollHeight;
  }, [lastMessage, myUserId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-3 sm:px-4">
        <Link to="/mensagens" aria-label="Voltar para as conversas" className="rounded-full p-2 text-slate-300 hover:bg-white/5 hover:text-white lg:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <PatriotAvatar name={other.name} shape={role === "dev" ? "square" : "circle"} className="size-10" textClassName="text-base" />
        <div className="min-w-0 flex-1">
          <Link to={otherTo} className="block truncate font-semibold text-white hover:text-flag-green">
            {other.name}
          </Link>
          <p className="truncate text-xs text-slate-400">
            {conversation.application_kind === "job" ? "Vaga" : "Projeto"}: {conversation.opportunity_title}
          </p>
        </div>
        <ApplicationStatusBadge status={conversation.application_status} label={STATUS_LABEL[conversation.application_status]} />
      </header>

      {socket === "reconnecting" && (
        <p role="status" className="bg-flag-yellow/10 px-4 py-1.5 text-center text-xs text-flag-yellow">
          Reconectando... as mensagens novas aparecem assim que a conexão voltar.
        </p>
      )}

      <div
        ref={listRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
        }}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 sm:px-5"
      >
        {isLoading && <Spinner label="Carregando mensagens" />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {messages && messages.length === 0 && <p className="py-16 text-center text-sm text-slate-500">Nenhuma mensagem ainda. Comece a conversa.</p>}
        {groups.map((group) => (
          <section key={group.day} className="space-y-2" aria-label={group.label}>
            <p className="sticky top-0 z-10 mx-auto w-fit rounded-full bg-ink/90 px-3 py-0.5 text-[11px] font-medium text-slate-400">{group.label}</p>
            {group.messages.map((message) => (
              <MessageBubble key={message.message_id} message={message} mine={message.sender_id === myUserId} />
            ))}
          </section>
        ))}
      </div>

      {conversation.can_send ? (
        <MessageComposer conversationId={conversationId} />
      ) : (
        <p className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-4 text-center text-sm text-slate-400">
          <Lock className="size-4 shrink-0" aria-hidden />
          Conversa encerrada: a candidatura foi {conversation.application_status === "withdrawn" ? "retirada" : "recusada"}. O histórico continua disponível.
        </p>
      )}
    </div>
  );
}