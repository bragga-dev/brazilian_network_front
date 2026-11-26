import { MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ChatInfoPanel } from "@/components/chat/ChatInfoPanel";
import { ChatThread } from "@/components/chat/ChatThread";
import { ConversationList } from "@/components/chat/ConversationList";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useChat";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/errors";

const REFRESH_MS = 20_000;

/**
 * Tela cheia (o Layout tira o rodapé nesta rota): conversas | conversa aberta | painel da outra parte.
 * No celular alterna entre a lista e a conversa; o painel direito só aparece a partir de xl.
 */
export default function MessagesPage() {
  const { conversationId } = useParams();
  const { me } = useAuth();
  const { data: conversations, isLoading, isFetching, isError, error, refetch } = useConversations(REFRESH_MS);

  const role = me?.user.role === "company" ? "company" : "dev";
  const current = conversations?.find((conversation) => conversation.conversation_id === conversationId);

  if (isLoading) return <Spinner label="Carregando conversas" />;

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!conversations || conversations.length === 0 || !me) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Nenhuma conversa ainda">
          <p>As conversas começam a partir de uma candidatura em análise ou aprovada.</p>
          <Link to={role === "company" ? "/empresa/candidaturas" : "/candidaturas"} className={buttonClasses("primary", "sm", "mt-5")}>
            {role === "company" ? "Ver candidaturas recebidas" : "Ver minhas candidaturas"}
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 bg-surface/60 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[26rem_minmax(0,1fr)_23rem]">
      <aside className={cn("min-h-0 border-white/10 lg:border-r", conversationId ? "hidden lg:block" : "block")} aria-label="Conversas">
        <ConversationList conversations={conversations} role={role} />
      </aside>

      <section className={cn("min-h-0 min-w-0", conversationId ? "block" : "hidden lg:block")} aria-label="Conversa aberta">
        {current ? (
          <ChatThread key={current.conversation_id} conversation={current} myUserId={me.user.user_id} role={role} />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <MessageCircle className="size-14 text-flag-green/60" strokeWidth={1.4} aria-hidden />
              <p className="text-sm">{!conversationId ? "Selecione uma conversa para começar." : isFetching ? "Abrindo conversa..." : "Conversa não encontrada."}</p>
            </div>
          </div>
        )}
      </section>

      {current && (
        <aside className="hidden min-h-0 border-l border-white/10 xl:block" aria-label="Detalhes da conversa">
          <ChatInfoPanel key={current.conversation_id} conversation={current} role={role} />
        </aside>
      )}
    </div>
  );
}