import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";
import { useSubscribe } from "@/hooks/useMembership";
import type { MembershipPlan } from "@/types/membership";
import { getErrorMessage } from "@/utils/errors";
import { formatMoney } from "@/utils/format";

/** Plano de apoio, pago por Pix. Nenhum dado pessoal é pedido: ao confirmar, o Pix aparece no painel do apoio. */
export function PlanCard({ plan, canSubscribe }: { plan: MembershipPlan; canSubscribe: boolean }) {
  const { status } = useAuth();
  const subscribe = useSubscribe();
  const [open, setOpen] = useState(false);

  const submit = () => subscribe.mutate({ plan_id: plan.plan_id }, { onSuccess: () => setOpen(false) });

  return (
    <Panel className="flex flex-col gap-4 border-flag-yellow/30 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border border-flag-yellow/40 bg-flag-yellow/10 text-flag-yellow">
          <ShieldCheck className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-flag-yellow">Assinatura mensal</p>
          <p className="text-lg font-semibold text-white">{plan.name}</p>
        </div>
      </div>

      <p className="text-4xl font-extrabold tracking-tight text-white">
        {formatMoney(plan.value)}
        <span className="text-sm font-normal text-slate-400"> /mês</span>
      </p>

      {plan.description && <p className="whitespace-pre-line text-sm text-slate-400">{plan.description}</p>}

      <ul className="space-y-1.5 text-sm text-slate-300">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-flag-green" aria-hidden /> Selo de patriota no perfil
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-flag-green" aria-hidden /> Destaque na lista de apoiadores
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-flag-green" aria-hidden /> Sem fidelidade, renove quando quiser
        </li>
      </ul>

      <div className="mt-auto pt-2">
        {status === "anonymous" && (
          <Link to="/entrar" className={buttonClasses("primary", "md", "w-full")}>
            Entrar para apoiar
          </Link>
        )}
        {status === "authenticated" && canSubscribe && (
          <Button className="w-full" onClick={() => setOpen(true)}>
            Quero apoiar
          </Button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Apoiar: ${plan.name}`}>
        <div className="space-y-4">
          {subscribe.isError && <FormMessage tone="error">{getErrorMessage(subscribe.error)}</FormMessage>}
          <p className="text-sm text-slate-400">Ao confirmar, geramos um Pix de {formatMoney(plan.value)} para o primeiro mês. O selo de patriota é concedido quando o pagamento for confirmado.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Voltar
            </Button>
            <Button size="sm" loading={subscribe.isPending} onClick={submit}>
              Confirmar apoio
            </Button>
          </div>
        </div>
      </Modal>
    </Panel>
  );
}