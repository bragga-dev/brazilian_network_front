import { useState } from "react";
import { Link } from "react-router-dom";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";
import { useSubscribe } from "@/hooks/useMembership";
import type { MembershipPlan } from "@/types/membership";
import { getErrorMessage } from "@/utils/errors";
import { formatMoney } from "@/utils/format";

/** Plano de apoio. Dev informa CPF/CNPJ; empresa usa o CNPJ do perfil. O link de pagamento aparece no painel da assinatura. */
export function PlanCard({ plan, canSubscribe }: { plan: MembershipPlan; canSubscribe: boolean }) {
  const { status, me } = useAuth();
  const subscribe = useSubscribe();
  const [open, setOpen] = useState(false);
  const [document, setDocument] = useState("");
  const isDev = me?.user.role === "dev";

  const submit = () =>
    subscribe.mutate(
      { plan_id: plan.plan_id, cpf_cnpj: isDev ? document : undefined },
      { onSuccess: () => setOpen(false) },
    );

  return (
    <Panel className="flex flex-col gap-3 p-6">
      <p className="text-lg font-semibold text-white">{plan.name}</p>
      <p className="text-3xl font-bold text-flag-yellow">
        {formatMoney(plan.value)}
        <span className="text-sm font-normal text-slate-400"> /mês</span>
      </p>
      {plan.description && <p className="whitespace-pre-line text-sm text-slate-400">{plan.description}</p>}

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
          <p className="text-sm text-slate-400">
            Você vai receber um link para pagar por Pix, boleto ou cartão. O selo de patriota é concedido quando o pagamento for confirmado.
          </p>
          {isDev && (
            <Field label="CPF ou CNPJ" hint="Usado só para emitir a cobrança.">
              <Input inputMode="numeric" value={document} onChange={(event) => setDocument(event.target.value)} placeholder="000.000.000-00" />
            </Field>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Voltar
            </Button>
            <Button size="sm" loading={subscribe.isPending} disabled={isDev && !document.trim()} onClick={submit}>
              Confirmar apoio
            </Button>
          </div>
        </div>
      </Modal>
    </Panel>
  );
}