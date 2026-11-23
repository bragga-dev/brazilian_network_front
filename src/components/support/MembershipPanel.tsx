import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Panel } from "@/components/ui/Panel";
import { useCancelMembership } from "@/hooks/useMembership";
import type { Membership } from "@/types/membership";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatMoney } from "@/utils/format";

const TONE = { active: "green", pending: "yellow", overdue: "red", cancelled: "neutral" } as const;

/** Assinatura do usuário: pagar (enquanto pendente/em atraso) ou cancelar (o selo vale até o fim do período pago). */
export function MembershipPanel({ membership }: { membership: Membership }) {
  const cancel = useCancelMembership();
  const [confirming, setConfirming] = useState(false);
  const cancelled = membership.status === "cancelled";

  return (
    <Panel className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Seu apoio</p>
          <p className="mt-1 text-xl font-semibold text-white">{membership.plan.name}</p>
          <p className="text-sm text-slate-400">{formatMoney(membership.value)} por mês</p>
        </div>
        <Badge tone={TONE[membership.status]}>{membership.status_label}</Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-400">
        {membership.status === "pending" && <p>Conclua o pagamento para receber o selo de patriota.</p>}
        {membership.status === "overdue" && <p>Há um pagamento em atraso. Regularize para manter o selo.</p>}
        {membership.status === "active" && membership.current_period_end && <p>Renova em {formatDate(membership.current_period_end)}.</p>}
        {cancelled && membership.current_period_end && <p>Cancelado. O selo vale até {formatDate(membership.current_period_end)}.</p>}
      </div>

      {cancel.isError && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {getErrorMessage(cancel.error)}
        </p>
      )}

      {!cancelled && (
        <div className="mt-4 flex flex-wrap gap-2">
          {membership.payment_url && (
            <a href={membership.payment_url} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "sm")}>
              Ir para o pagamento <ExternalLink className="size-4" aria-hidden />
            </a>
          )}
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
            Cancelar apoio
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Cancelar apoio"
        message="O selo continua valendo até o fim do período já pago. Não haverá novas cobranças."
        confirmLabel="Cancelar apoio"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(undefined, { onSettled: () => setConfirming(false) })}
        onClose={() => setConfirming(false)}
      />
    </Panel>
  );
}