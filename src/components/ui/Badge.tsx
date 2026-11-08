import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type Tone = "neutral" | "green" | "yellow" | "blue";

const TONES: Record<Tone, string> = {
  neutral: "border-white/10 text-slate-300",
  green: "border-flag-green/40 bg-flag-green/10 text-flag-green",
  yellow: "border-flag-yellow/40 bg-flag-yellow/10 text-flag-yellow",
  blue: "border-flag-blue/40 bg-flag-blue/10 text-blue-300",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", TONES[tone])}>
      {children}
    </span>
  );
}
