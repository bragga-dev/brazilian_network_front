import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useConsents, useUpdateConsents } from "@/hooks/useAccount";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";

function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PrivacyPanel() {
  const { data, isLoading, isError, error, refetch } = useConsents();
  const update = useUpdateConsents();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async () => {
    setExporting(true);
    setExportError(null);
    try {
      downloadJson(await authService.exportMyData(), "meus-dados-brazilian-network.json");
    } catch (err) {
      setExportError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-5">
      {(update.isError || exportError) && <FormMessage tone="error">{exportError ?? getErrorMessage(update.error)}</FormMessage>}

      <div className="rounded-xl border border-white/10 p-4 text-sm">
        <p className="text-slate-300">
          Termos de Uso e Privacidade:{" "}
          <span className={data.needs_reacceptance ? "text-flag-yellow" : "text-flag-green"}>
            {data.needs_reacceptance ? "novo aceite necessário" : "aceitos"}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Versão aceita: {data.terms_version_accepted || "—"} / {data.privacy_version_accepted || "—"}
          {data.terms_accepted_at && ` · em ${new Date(data.terms_accepted_at).toLocaleDateString("pt-BR")}`}
        </p>
        {data.needs_reacceptance && (
          <Button size="sm" className="mt-3" loading={update.isPending} onClick={() => update.mutate({ accepted_terms: true })}>
            Aceitar versão vigente
          </Button>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={data.marketing_opt_in}
          disabled={update.isPending}
          onChange={(e) => update.mutate({ marketing_opt_in: e.target.checked })}
          className="mt-0.5 size-4 accent-flag-green"
        />
        <span>Quero receber novidades e comunicações de marketing por e-mail.</span>
      </label>

      <div className="border-t border-white/10 pt-5">
        <p className="text-sm text-slate-400">Baixe uma cópia dos seus dados pessoais (conta, consentimentos, perfil e endereços).</p>
        <Button variant="secondary" size="sm" className="mt-3" loading={exporting} onClick={() => void exportData()}>
          <Download className="size-4" /> Exportar meus dados
        </Button>
      </div>
    </div>
  );
}