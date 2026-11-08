import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

/** Painel de vidro escuro: borda fina, cantos arredondados, leve degradê. */
export function Panel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

type Tone = "green" | "yellow" | "blue" | "muted";

const TONES: Record<Tone, string> = {
  green: "text-flag-green",
  yellow: "text-flag-yellow",
  blue: "text-blue-400",
  muted: "text-slate-500",
};

/** Rótulo de seção em caixa alta (usado nas páginas internas). */
export function SectionLabel({ children, tone = "green", className }: { children: string; tone?: Tone; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", TONES[tone], className)}>{children}</p>;
}