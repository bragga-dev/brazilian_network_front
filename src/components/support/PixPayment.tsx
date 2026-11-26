import { Check, Copy, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Membership } from "@/types/membership";
import { formatMoney } from "@/utils/format";

interface Props {
  membership: Membership;
  onNewPix: () => void;
  generating: boolean;
}

/** Pix em aberto: QR Code e copia e cola. A confirmação chega pelo webhook e a tela atualiza sozinha. */
export function PixPayment({ membership, onNewPix, generating }: Props) {
  const [copied, setCopied] = useState(false);
  const { pix_qr_code: qrCode, pix_copy_paste: code, pix_expires_at: expiresAt } = membership;
  const expired = Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!code) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Sem permissão da área de transferência: o código segue selecionável no campo.
    }
  };

  if (expired) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-slate-300">Este Pix expirou. Gere um novo para pagar.</p>
        <Button className="mt-3" size="sm" loading={generating} onClick={onNewPix}>
          <RefreshCw className="size-4" aria-hidden /> Gerar novo Pix
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
      {qrCode && <img src={`data:image/png;base64,${qrCode}`} alt={`QR Code Pix de ${formatMoney(membership.value)}`} className="mx-auto size-44 rounded-lg bg-white p-2" />}
      <div className="min-w-0 space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Pague {formatMoney(membership.value)} por Pix</p>
          <p className="mt-0.5 text-sm text-slate-400">Leia o QR Code ou use o copia e cola no app do seu banco.</p>
        </div>
        <input readOnly value={code} aria-label="Pix copia e cola" onFocus={(event) => event.target.select()} className="w-full truncate rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300" />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => void copy()}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? "Copiado" : "Copiar código"}
          </Button>
          {expiresAt && <span className="text-xs text-slate-500">Válido até {new Date(expiresAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>}
        </div>
        <p className="text-xs text-slate-500" aria-live="polite">Assim que o pagamento for confirmado, esta tela atualiza sozinha.</p>
      </div>
    </div>
  );
}