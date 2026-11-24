import { Download, Eye } from "lucide-react";
import { useState } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";

function fileName(url: string, owner: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  const safeExt = ext && /^[a-z0-9]{2,5}$/.test(ext) ? ext : "pdf";
  const slug = owner
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `curriculo-${slug || "dev"}.${safeExt}`;
}

/** Visualizar (abre em nova aba) e baixar o currículo do dev. Só é montado para empresa/admin. */
export function CurriculumAccess({ url, name }: { url: string; name: string }) {
  const [busy, setBusy] = useState(false);

  // `download` no <a> é ignorado em outra origem; por isso baixa via blob e, se o CORS bloquear, abre em nova aba.
  const download = async () => {
    setBusy(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("download");
      const href = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName(url, name);
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 md:justify-start">
      <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "sm")}>
        <Eye className="size-4" aria-hidden /> Visualizar currículo
      </a>
      <Button variant="secondary" size="sm" loading={busy} onClick={() => void download()}>
        <Download className="size-4" aria-hidden /> Baixar
      </Button>
    </div>
  );
}