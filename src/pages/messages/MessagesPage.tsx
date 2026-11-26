import { Link, useParams } from "react-router-dom";

import { ChatThread } from "@/components/chat/ChatThread";
import { ConversationList } from "@/components/chat/ConversationList";
import { buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useChat";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/errors";

const REFRESH_MS = 20_000;

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { me } = useAuth();
  const { data: conversations, isLoading, isFetching, isError, error, refetch } = useConversations(REFRESH_MS);

  const role = me?.user.role === "company" ? "company" : "dev";
  const current = conversations?.find((conversation) => conversation.conversation_id === conversationId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        label="Mensagens"
        title="Conversas"
        description="Converse com empresas e devs sobre candidaturas em análise ou aprovadas. Anexe fotos, vídeos, PDF e TXT quando precisar."
      />

      <div className="mt-8">
        {isLoading && <Spinner label="Carregando conversas" />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

        {conversations && conversations.length === 0 && (
          <EmptyState title="Nenhuma conversa ainda">
            <p>As conversas começam a partir de uma candidatura em análise ou aprovada.</p>
            <Link to={role === "company" ? "/empresa/candidaturas" : "/candidaturas"} className={buttonClasses("primary", "sm", "mt-5")}>
              {role === "company" ? "Ver candidaturas recebidas" : "Ver minhas candidaturas"}
            </Link>
          </EmptyState>
        )}

        {conversations && conversations.length > 0 && me && (
          <Panel className="grid h-[calc(100dvh-19rem)] min-h-[32rem] overflow-hidden lg:grid-cols-[22rem_minmax(0,1fr)]">
            <aside className={cn("min-h-0 overflow-y-auto border-white/10 lg:border-r", conversationId ? "hidden lg:block" : "block")} aria-label="Conversas">
              <ConversationList conversations={conversations} role={role} />
            </aside>

            <section className={cn("min-h-0", conversationId ? "block" : "hidden lg:block")} aria-label="Conversa aberta">
              {current ? (
                <ChatThread key={current.conversation_id} conversation={current} myUserId={me.user.user_id} role={role} />
              ) : (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-slate-500">
                  {!conversationId ? "Selecione uma conversa para começar." : isFetching ? "Abrindo conversa..." : "Conversa não encontrada."}
                </div>
              )}
            </section>
          </Panel>
        )}
      </div>
    </div>
  );
}