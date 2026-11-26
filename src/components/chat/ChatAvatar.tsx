import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { useChatPeer } from "@/hooks/useChatPeer";
import type { ChatParticipant } from "@/types/chat";

interface Props {
  participant: ChatParticipant;
  /** Papel de quem está logado: a outra parte é o oposto (dev vê empresa, empresa vê dev). */
  viewerRole: "dev" | "company";
  /** Ex.: "size-12". */
  className?: string;
  textClassName?: string;
}

/** Foto da outra parte da conversa (logo quadrada para empresa, círculo para dev), com selo patriota quando houver. */
export function ChatAvatar({ participant, viewerRole, className, textClassName }: Props) {
  const otherRole = viewerRole === "dev" ? "company" : "dev";
  const peer = useChatPeer(participant, otherRole);
  return (
    <PatriotAvatar
      name={participant.name}
      url={peer.photoUrl}
      patriot={peer.patriot}
      shape={otherRole === "company" ? "square" : "circle"}
      className={className}
      textClassName={textClassName}
    />
  );
}