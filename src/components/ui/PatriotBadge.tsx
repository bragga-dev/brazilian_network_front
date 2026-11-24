import { cn } from "@/utils/cn";

import { BrazilFlag } from "./BrazilFlag";

/** Etiqueta do apoiador: bandeira do Brasil + "Patriota" numa pílula com borda nas cores da bandeira. */
export function PatriotBadge({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full bg-linear-to-r from-flag-green via-flag-yellow to-flag-blue p-px shadow-[0_0_14px_-4px_var(--color-flag-yellow)]", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-ink font-bold uppercase tracking-wider text-flag-yellow",
          size === "sm" ? "gap-1.5 py-0.5 pl-1.5 pr-2.5 text-[10px]" : "gap-2 py-1 pl-2 pr-3.5 text-xs",
        )}
      >
        <BrazilFlag className={size === "sm" ? "h-3.5 w-auto" : "h-5 w-auto"} />
        Patriota
      </span>
    </span>
  );
}