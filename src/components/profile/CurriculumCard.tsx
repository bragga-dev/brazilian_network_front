import { FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useIdentityMutation } from "@/hooks/useProfile";
import { accountService } from "@/services/account.service";
import { getErrorMessage } from "@/utils/errors";

const ACCEPT = ".pdf,.doc,.docx,.docm,.pages";
const MAX_MB = 5;

export function CurriculumCard({ url }: { url: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useIdentityMutation(accountService.uploadCurriculum);
  const remove = useIdentityMutation(async (_: void) => accountService.deleteCurriculum());
  const busy = upload.isPending || remove.isPending;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) return setError(`O arquivo passa de ${MAX_MB} MB.`);
    try {
      await upload.mutateAsync(file);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível enviar o currículo."));
    }
  };

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Currículo</h2>
      <p className="mt-1 text-sm text-slate-500">PDF, DOC, DOCX, DOCM ou PAGES, até {MAX_MB} MB. Só você e as empresas com quem se candidatar veem.</p>
      {error && (
        <div className="mt-4">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white hover:border-flag-green/50">
          <FileText className="size-5 text-flag-green" /> Abrir currículo atual
        </a>
      )}
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" loading={upload.isPending} disabled={busy} onClick={() => input.current?.click()}>
          <Upload className="size-4" /> {url ? "Trocar arquivo" : "Enviar currículo"}
        </Button>
        {url && (
          <Button variant="ghost" size="sm" loading={remove.isPending} disabled={busy} onClick={() => remove.mutate()}>
            <Trash2 className="size-4" /> Remover
          </Button>
        )}
      </div>
    </Panel>
  );
}