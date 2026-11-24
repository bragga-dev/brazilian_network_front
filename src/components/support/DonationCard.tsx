import { ExternalLink, HeartHandshake } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { PIX_DONATION_URL } from "@/constants/support";

/** Doação livre por Pix: sem assinatura, o apoiador escolhe o valor na página de pagamento. */
export function DonationCard() {
  return (
    <Panel className="flex h-full flex-col gap-4 border-flag-blue/30 p-6">
      <span className="flex size-11 items-center justify-center rounded-xl border border-flag-blue/40 bg-flag-blue/10 text-blue-300">
        <HeartHandshake className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Doação livre</p>
        <p className="mt-1 text-lg font-semibold text-white">Doe o valor que quiser</p>
        <p className="mt-2 text-sm text-slate-400">Sem assinatura e sem cadastro. Abra o link, informe o valor e pague por Pix, pelo Nubank ou por qualquer outro banco.</p>
      </div>
      <p className="text-xs text-slate-500">Doações livres não concedem o selo de patriota, que é exclusivo da assinatura mensal.</p>
      <a href={PIX_DONATION_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md", "mt-auto w-full")}>
        Doar via Pix <ExternalLink className="size-4" aria-hidden />
      </a>
    </Panel>
  );
}