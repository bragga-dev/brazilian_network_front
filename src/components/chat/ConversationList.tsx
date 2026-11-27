import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { ChatAvatar } from "@/components/chat/ChatAvatar";
import type { Conversation } from "@/types/chat";
import { cn } from "@/utils/cn";
import { formatTimeAgo } from "@/utils/format";

interface Props {
  conversations: Conversation[];
  role: "dev" | "company";
}

/** Coluna de conversas estilo Messenger: busca no topo, avatar grande, prévia e contador de não lidas. */
export function ConversationList({ conversations, role }: Props) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    // Mais recente primeiro: conversa com mensagem nova sobe para o topo.
    const sorted = [...conversations].sort((a, b) => Date.parse(b.last_message_at ?? b.created_at) - Date.parse(a.last_message_at ?? a.created_at));
    if (!term) return sorted;
    return sorted.filter((conversation) => {
      const other = role === "dev" ? conversation.company : conversation.dev;
      return other.name.toLowerCase().includes(term) || conversation.opportunity_title.toLowerCase().includes(term);
    });
  }, [conversations, query, role]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 px-4 pb-3 pt-5">
        <h1 className="text-2xl font-bold text-white">Conversas</h1>
        <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 focus-within:border-flag-green/60">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversas..."
            aria-label="Buscar conversas"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </label>
      </div>

      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {visible.length === 0 && <li className="px-3 py-10 text-center text-sm text-slate-500">Nenhuma conversa encontrada.</li>}
        {visible.map((conversation) => {
          const other = role === "dev" ? conversation.company : conversation.dev;
          const unread = conversation.unread_count;
          return (
            <li key={conversation.conversation_id}>
              <NavLink
                to={`/mensagens/${conversation.conversation_id}`}
                className={({ isActive }) =>
                  cn("flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.05]", isActive && "bg-flag-green/10 ring-1 ring-flag-green/30")
                }
              >
                <ChatAvatar participant={other} viewerRole={role} className="size-14" textClassName="text-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn("truncate text-[15px] text-white", unread > 0 ? "font-bold" : "font-semibold")}>{other.name}</p>
                    <time className={cn("shrink-0 text-[11px]", unread > 0 ? "font-semibold text-flag-green" : "text-slate-500")} dateTime={conversation.last_message_at ?? conversation.created_at}>
                      {formatTimeAgo(conversation.last_message_at ?? conversation.created_at)}
                    </time>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", unread > 0 ? "font-medium text-slate-200" : "text-slate-400")}>
                      {conversation.application_kind === "job" ? "Vaga" : "Projeto"}: {conversation.opportunity_title}
                    </p>
                    {unread > 0 && (
                      <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-flag-green px-1.5 text-[11px] font-bold leading-5 text-black" aria-label={`${unread} não lidas`}>
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}