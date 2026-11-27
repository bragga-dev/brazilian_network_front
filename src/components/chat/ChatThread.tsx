import { ArrowLeft, Lock } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { MessageBubble, type ClusterPosition } from "@/components/chat/MessageBubble";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useMarkRead, useMessages } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import type { ChatMessage, Conversation } from "@/types/chat";
import { STATUS_LABEL, groupByDay } from "@/utils/chat";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/errors";

interface Props {
  conversation: Conversation;
  myUserId: string;
  /** Quem está logado: define quem é "a outra parte" e para onde o nome dela aponta. */
  role: "dev" | "company";
}

const NEAR_BOTTOM_PX = 96;
const POLL_FALLBACK_MS = 8_000;

/** Primeira/meio/última de uma sequência de mensagens seguidas da mesma pessoa. */
function positionOf(messages: ChatMessage[], index: number): ClusterPosition {
  const sender = messages[index].sender_id;
  const samePrev = messages[index - 1]?.sender_id === sender;
  const sameNext = messages[index + 1]?.sender_id === sender;
  if (samePrev && sameNext) return "middle";
  if (samePrev) return "last";
  if (sameNext) return "first";
  return "single";
}

export function ChatThread({ conversation, myUserId, role }: Props) {
  const { conversation_id: conversationId } = conversation;
  const other = role === "dev" ? conversation.company : conversation.dev;
  const otherTo = role === "dev" ? `/empresas/${other.id}` : `/devs/${other.id}`;

  const socket = useChatSocket(conversationId, myUserId);
  // Sem WebSocket aberto (caiu, ainda conectando, back sem canal), busca por polling para as mensagens novas aparecerem.
  const { data: messages, isLoading, isError, error, refetch } = useMessages(conversationId, socket === "open" ? false : POLL_FALLBACK_MS);
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
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-3 sm:px-5">
        <Link to="/mensagens" aria-label="Voltar para as conversas" className="rounded-full p-2 text-slate-300 hover:bg-white/5 hover:text-white lg:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <ChatAvatar participant={other} viewerRole={role} className="size-11" textClassName="text-lg" />
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
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
      >
        {isLoading && <Spinner label="Carregando mensagens" />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {messages && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <ChatAvatar participant={other} viewerRole={role} className="size-24" textClassName="text-4xl" />
            <p className="font-semibold text-white">{other.name}</p>
            <p className="text-sm text-slate-500">Nenhuma mensagem ainda. Diga um oi para começar a conversa.</p>
          </div>
        )}
        {groups.map((group) => (
          <section key={group.day} aria-label={group.label}>
            <p className="sticky top-0 z-10 mx-auto my-3 w-fit rounded-full border border-white/10 bg-ink/90 px-3.5 py-1 text-[11px] font-medium text-slate-400">{group.label}</p>
            {group.messages.map((message, index) => {
              const position = positionOf(group.messages, index);
              const startsCluster = position === "single" || position === "first";
              return (
                <div key={message.message_id} className={cn(index === 0 ? "" : startsCluster ? "mt-3" : "mt-0.5")}>
                  <MessageBubble
                    message={message}
                    mine={message.sender_id === myUserId}
                    position={position}
                    avatar={<ChatAvatar participant={other} viewerRole={role} className="size-8" textClassName="text-xs" />}
                  />
                </div>
              );
            })}
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