import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/errors";

import { CompanyLogo } from "./CompanyLogo";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5; // mesmo limite do backend

interface Props {
  name: string;
  url: string | null;
  rounded?: "full" | "2xl";
  className?: string;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
}

/** Foto/logo com botão de trocar e remover. Valida tipo e tamanho antes de enviar. */
export function PhotoUploader({ name, url, rounded = "full", className, onUpload, onRemove }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível atualizar a foto."));
    } finally {
      setBusy(false);
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return setError("Use uma imagem JPG, PNG ou WEBP.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`A imagem passa de ${MAX_MB} MB.`);
    void run(() => onUpload(file));
  };

  const shape = rounded === "full" ? "rounded-full" : "rounded-2xl";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("group relative size-28 shrink-0 p-[3px]", shape, "bg-linear-to-br from-flag-green via-flag-yellow to-flag-blue")}>
        <div className={cn("size-full overflow-hidden bg-ink", shape, busy && "opacity-50")}>
          {url ? (
            <img src={url} alt={`Foto de ${name}`} className="size-full object-cover" />
          ) : (
            <CompanyLogo name={name} className={cn("size-full text-4xl", shape)} />
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          aria-label="Alterar foto"
          className={cn(
            "absolute inset-[3px] flex items-center justify-center bg-black/55 text-white opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100",
            shape,
          )}
        >
          <Camera className="size-6" />
        </button>
      </div>
      <input ref={input} type="file" accept={ALLOWED.join(",")} hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="flex items-center gap-2 text-xs">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="font-medium text-flag-green hover:underline disabled:opacity-50">
          {busy ? "Enviando..." : "Alterar foto"}
        </button>
        {url && (
          <button type="button" disabled={busy} onClick={() => void run(onRemove)} className="flex items-center gap-1 text-slate-500 hover:text-red-400 disabled:opacity-50">
            <Trash2 className="size-3.5" /> Remover
          </button>
        )}
      </div>
      {error && <p role="alert" className="max-w-52 text-center text-xs text-red-300">{error}</p>}
    </div>
  );
}