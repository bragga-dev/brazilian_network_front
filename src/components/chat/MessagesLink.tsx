import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { useChatEligible, useUnreadMessages } from "@/hooks/useChat";

/** Atalho do cabeçalho para /mensagens, com o total de mensagens não lidas. */
export function MessagesLink() {
  const eligible = useChatEligible();
  const unread = useUnreadMessages();
  if (!eligible) return null;

  return (
    <Link
      to="/mensagens"
      aria-label={unread > 0 ? `Mensagens (${unread} não lidas)` : "Mensagens"}
      className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      <MessageSquare className="size-5" />
      {unread > 0 && (
        <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-flag-green px-1 text-[10px] font-bold leading-4 text-black">{unread > 99 ? "99+" : unread}</span>
      )}
    </Link>
  );
}