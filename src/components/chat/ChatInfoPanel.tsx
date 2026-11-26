import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { useChatPeer } from "@/hooks/useChatPeer";
import type { Conversation } from "@/types/chat";
import { STATUS_LABEL } from "@/utils/chat";
import { formatDate } from "@/utils/format";

interface Props {
  conversation: Conversation;
  role: "dev" | "company";
}

/** Coluna direita (telas largas): quem é a outra parte, o assunto da conversa e atalho para o perfil. */
export function ChatInfoPanel({ conversation, role }: Props) {
  const otherRole = role === "dev" ? "company" : "dev";
  const other = role === "dev" ? conversation.company : conversation.dev;
  const otherTo = role === "dev" ? `/empresas/${other.id}` : `/devs/${other.id}`;
  const peer = useChatPeer(other, otherRole, true);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto px-5 py-8">
      <div className="flex flex-col items-center text-center">
        <PatriotAvatar
          name={other.name}
          url={peer.photoUrl}
          patriot={peer.patriot}
          shape={otherRole === "company" ? "square" : "circle"}
          className="size-28"
          textClassName="text-4xl"
        />
        <h2 className="mt-4 text-xl font-bold text-white">{other.name}</h2>
        {peer.subtitle && <p className="mt-1 line-clamp-3 text-sm text-slate-400">{peer.subtitle}</p>}
        {peer.patriot && <PatriotBadge className="mt-3" />}
        {peer.location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="size-4" aria-hidden /> {peer.location}
          </p>
        )}
        <Link to={otherTo} className={buttonClasses("secondary", "sm", "mt-5")}>
          Ver perfil completo <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </div>

      <dl className="space-y-4 border-t border-white/10 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{conversation.application_kind === "job" ? "Vaga" : "Projeto"}</dt>
          <dd className="mt-1 font-medium text-white">{conversation.opportunity_title}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Candidatura</dt>
          <dd className="mt-1">
            <ApplicationStatusBadge status={conversation.application_status} label={STATUS_LABEL[conversation.application_status]} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversa iniciada em</dt>
          <dd className="mt-1 text-slate-300">{formatDate(conversation.created_at)}</dd>
        </div>
      </dl>
    </div>
  );
}