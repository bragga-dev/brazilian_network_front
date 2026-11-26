import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useChatEligible, useConversations, useStartConversation } from "@/hooks/useChat";
import { useReceivedJobs, useReceivedProjects } from "@/hooks/useManage";
import type { ApplicationKind } from "@/types/application";
import { canStartChat } from "@/utils/chat";
import { getErrorMessage } from "@/utils/errors";

interface Candidate {
  kind: ApplicationKind;
  id: string;
  devId: string;
  updatedAt: string;
}

/**
 * "Enviar mensagem" no perfil público do dev (só para empresa). O back só abre conversa a partir de uma
 * candidatura em análise ou aprovada, então: reaproveita a conversa que já existe com o dev; senão abre
 * pela candidatura mais recente dele que esteja elegível; sem nenhuma, o botão fica desabilitado e explica por quê.
 */
export function MessageDevButton({ devId }: { devId: string }) {
  const navigate = useNavigate();
  const { me } = useAuth();
  const isCompany = me?.user.role === "company";
  const eligible = useChatEligible();
  const enabled = isCompany && eligible;

  const conversations = useConversations();
  const jobs = useReceivedJobs({ page_size: 100 }, enabled);
  const projects = useReceivedProjects({ page_size: 100 }, enabled);
  const start = useStartConversation();

  if (!isCompany) return null;

  const existing = conversations.data?.find((conversation) => conversation.dev.id === devId);
  const candidates: Candidate[] = [
    ...(jobs.data?.items ?? []).map((a) => ({ kind: "job" as const, id: a.send_job_application_id, devId: a.dev.dev_id, status: a.status, updatedAt: a.updated_at })),
    ...(projects.data?.items ?? []).map((a) => ({ kind: "project" as const, id: a.send_project_application_id, devId: a.dev.dev_id, status: a.status, updatedAt: a.updated_at })),
  ]
    .filter((a) => a.devId === devId && canStartChat(a.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const target = candidates[0];

  const loading = enabled && (conversations.isLoading || jobs.isLoading || projects.isLoading);
  const canChat = enabled && Boolean(existing || target);

  const open = () => {
    if (existing) {
      navigate(`/mensagens/${existing.conversation_id}`);
    } else if (target) {
      start.mutate({ application_kind: target.kind, application_id: target.id }, { onSuccess: (conversation) => navigate(`/mensagens/${conversation.conversation_id}`) });
    }
  };

  const hint = !eligible
    ? "Mensagens ficam disponíveis para empresas com conta verificada."
    : !canChat && !loading
      ? "Você pode conversar com devs que se candidataram e estão em análise ou aprovados."
      : null;

  return (
    <div className="flex flex-col items-center gap-2 md:items-start">
      <Button size="md" variant="primary" loading={start.isPending || loading} disabled={!canChat} onClick={open}>
        <MessageCircle className="size-4" aria-hidden /> Enviar mensagem
      </Button>
      {hint && <p className="max-w-xs text-xs text-slate-500">{hint}</p>}
      {start.isError && (
        <p role="alert" className="text-xs text-red-300">
          {getErrorMessage(start.error)}
        </p>
      )}
    </div>
  );
}