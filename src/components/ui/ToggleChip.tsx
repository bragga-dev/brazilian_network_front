import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

interface Props extends Omit<ComponentProps<"button">, "onChange"> {
  active: boolean;
  /** `patriot` usa o dourado da bandeira quando ativo. */
  tone?: "default" | "patriot";
}

/** Filtro liga/desliga em formato de pílula (acessível: aria-pressed). */
export function ToggleChip({ active, tone = "default", className, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-flag-green",
        active
          ? tone === "patriot"
            ? "border-flag-yellow/60 bg-flag-yellow/10 text-flag-yellow shadow-[0_0_18px_-8px_var(--color-flag-yellow)]"
            : "border-flag-green/60 bg-flag-green/10 text-flag-green"
          : "border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}