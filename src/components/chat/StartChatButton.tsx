import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useStartConversation } from "@/hooks/useChat";
import type { ApplicationKind } from "@/types/application";
import { getErrorMessage } from "@/utils/errors";

/** Abre (ou retoma) a conversa da candidatura e leva para ela. Só faz sentido para candidatura em análise ou aprovada. */
export function StartChatButton({ kind, applicationId }: { kind: ApplicationKind; applicationId: string }) {
  const navigate = useNavigate();
  const start = useStartConversation();

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        loading={start.isPending}
        onClick={() =>
          start.mutate({ application_kind: kind, application_id: applicationId }, { onSuccess: (conversation) => navigate(`/mensagens/${conversation.conversation_id}`) })
        }
      >
        <MessageSquare className="size-4" aria-hidden /> Conversar
      </Button>
      {start.isError && (
        <span role="alert" className="self-center text-xs text-red-300">
          {getErrorMessage(start.error)}
        </span>
      )}
    </>
  );
}