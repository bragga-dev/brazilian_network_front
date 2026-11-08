import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

/** Painel de borda fina e cantos retos (linguagem visual da referência). */
export function Panel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("border border-white/10 bg-white/[0.02]", className)} {...props} />;
}

type Tone = "green" | "yellow" | "blue" | "muted";

const TONES: Record<Tone, string> = {
  green: "text-flag-green",
  yellow: "text-flag-yellow",
  blue: "text-flag-blue",
  muted: "text-slate-500",
};

/** Rótulo mono em caixa alta: [ STATUS DO SISTEMA ] */
export function SectionLabel({ children, tone = "green", className }: { children: string; tone?: Tone; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em]", TONES[tone], className)}>[ {children} ]</p>
  );
}
