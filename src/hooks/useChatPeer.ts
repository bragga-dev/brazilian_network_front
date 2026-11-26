import type { ChatParticipant } from "@/types/chat";

import { useCompany } from "./useCompanies";
import { usePublicProfile } from "./useProfile";

export interface ChatPeer {
  photoUrl: string | null;
  patriot: boolean;
  /** Dev: headline. Empresa: bio. */
  subtitle: string | null;
  /** Só empresa (o perfil público do dev não traz cidade). */
  location: string | null;
}

/**
 * A outra parte da conversa. O Conversation do back traz só id e nome, então a foto vem de `photo_url`
 * (se o back passar a mandar) ou do perfil público, cacheado pelo react-query (uma busca por pessoa).
 * `full` também busca subtítulo/cidade, para o painel lateral.
 */
export function useChatPeer(participant: ChatParticipant, otherRole: "dev" | "company", full = false): ChatPeer {
  const lookup = full || participant.photo_url === undefined;
  const dev = usePublicProfile(lookup && otherRole === "dev" ? participant.id : undefined).data?.dev;
  const company = useCompany(lookup && otherRole === "company" ? participant.id : undefined).data?.company;

  return {
    photoUrl: participant.photo_url ?? dev?.photo_url ?? company?.photo_url ?? null,
    patriot: participant.is_patriot ?? dev?.is_patriot ?? company?.is_patriot ?? false,
    subtitle: dev?.headline ?? company?.bio ?? null,
    location: company ? [company.city, company.state].filter(Boolean).join(" - ") || null : null,
  };
}