import { NavLink } from "react-router-dom";

import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import type { Conversation } from "@/types/chat";
import { cn } from "@/utils/cn";
import { formatTimeAgo } from "@/utils/format";

interface Props {
  conversations: Conversation[];
  role: "dev" | "company";
}

/** Lista lateral de conversas: a outra parte, a vaga/projeto, o tempo da última mensagem e o contador de não lidas. */
export function ConversationList({ conversations, role }: Props) {
  return (
    <ul className="divide-y divide-white/5">
      {conversations.map((conversation) => {
        const other = role === "dev" ? conversation.company : conversation.dev;
        const unread = conversation.unread_count;
        return (
          <li key={conversation.conversation_id}>
            <NavLink
              to={`/mensagens/${conversation.conversation_id}`}
              className={({ isActive }) => cn("flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.04]", isActive && "bg-white/[0.07]")}
            >
              <PatriotAvatar name={other.name} shape={role === "dev" ? "square" : "circle"} className="size-11 shrink-0" textClassName="text-base" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm text-white", unread > 0 ? "font-semibold" : "font-medium")}>{other.name}</p>
                  <time className="shrink-0 text-[11px] text-slate-500" dateTime={conversation.last_message_at ?? conversation.created_at}>
                    {formatTimeAgo(conversation.last_message_at ?? conversation.created_at)}
                  </time>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-400">
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
  );
}