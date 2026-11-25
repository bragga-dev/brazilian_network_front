import type { ReactNode } from "react";

import { SectionLabel } from "./Panel";

interface Props {
  label: string;
  tone?: "green" | "yellow" | "blue";
  title: string;
  description?: string;
  /** Conteúdo à direita (contador, ação). No mobile desce para baixo do título. */
  aside?: ReactNode;
}

/** Cabeçalho padrão das páginas de listagem. */
export function PageHeader({ label, tone = "green", title, description, aside }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <SectionLabel tone={tone}>{label}</SectionLabel>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-400">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}