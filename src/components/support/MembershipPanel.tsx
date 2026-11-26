import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

import { PixPayment } from "@/components/support/PixPayment";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";
import { useCancelMembership, useNewPix } from "@/hooks/useMembership";
import type { Membership } from "@/types/membership";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatMoney } from "@/utils/format";

const TONE = { active: "green", pending: "yellow", overdue: "red", cancelled: "neutral" } as const;

/** Apoio do usuário: pagar o Pix (primeiro mês ou renovação) ou cancelar (o selo vale até o fim do período pago). */
export function MembershipPanel({ membership }: { membership: Membership }) {
  const { me, refreshMe } = useAuth();
  const newPix = useNewPix();
  const cancel = useCancelMembership();
  const [confirming, setConfirming] = useState(false);
  const cancelled = membership.status === "cancelled";
  const hasOpenPix = Boolean(membership.pix_copy_paste);
  const activeWithoutBadge = membership.status === "active" && me?.user.is_patriot === false;
  const error = newPix.error ?? cancel.error;

  // Pagamento confirmado depois que /auth/me foi carregado: atualiza o selo (avatar e header) sem recarregar a página.
  useEffect(() => {
    if (activeWithoutBadge) void refreshMe();
  }, [activeWithoutBadge, refreshMe]);

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
        {membership.status === "pending" && <p>Pague o Pix para receber o selo de patriota.</p>}
        {membership.status === "overdue" && <p>O mês pago terminou. Gere um novo Pix para renovar e manter o selo.</p>}
        {membership.status === "active" && membership.current_period_end && <p>Pago até {formatDate(membership.current_period_end)}.</p>}
        {cancelled && membership.current_period_end && <p>Cancelado. O selo vale até {formatDate(membership.current_period_end)}.</p>}
      </div>

      {!cancelled && <PixPayment membership={membership} generating={newPix.isPending} onNewPix={() => newPix.mutate()} />}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {getErrorMessage(error)}
        </p>
      )}

      {!cancelled && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!hasOpenPix && (
            <Button variant={membership.status === "active" ? "secondary" : "primary"} size="sm" loading={newPix.isPending} onClick={() => newPix.mutate()}>
              <QrCode className="size-4" aria-hidden /> {membership.status === "active" ? "Renovar com Pix" : "Gerar Pix"}
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
            Cancelar apoio
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Cancelar apoio"
        message="O selo continua valendo até o fim do período já pago. Um Pix em aberto deixa de valer."
        confirmLabel="Cancelar apoio"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(undefined, { onSettled: () => setConfirming(false) })}
        onClose={() => setConfirming(false)}
      />
    </Panel>
  );
}