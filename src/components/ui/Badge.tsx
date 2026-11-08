import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type Tone = "neutral" | "green" | "yellow" | "blue" | "purple";

const TONES: Record<Tone, string> = {
  neutral: "border-white/15 bg-white/[0.03] text-slate-300",
  green: "border-flag-green/40 bg-flag-green/10 text-flag-green",
  yellow: "border-flag-yellow/40 bg-flag-yellow/10 text-flag-yellow",
  blue: "border-flag-blue/45 bg-flag-blue/10 text-blue-300",
  purple: "border-brand-purple/45 bg-brand-purple/10 text-purple-300",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium", TONES[tone])}>
      {children}
    </span>
  );
}