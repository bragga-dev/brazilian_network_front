import type { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface Props {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

/** Abas com rolagem horizontal no mobile e sublinhado verde no ativo. */
export function Tabs({ items, value, onChange }: Props) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-white/10 [scrollbar-width:none]">
      {items.map(({ id, label, icon: Icon, count }) => {
        const active = id === value;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              active ? "text-flag-green" : "text-slate-400 hover:text-white",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {label}
            {count !== undefined && <span className="rounded-full bg-white/10 px-1.5 text-[11px] text-slate-300">{count}</span>}
            {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-flag-green shadow-[0_0_10px_var(--color-flag-green)]" />}
          </button>
        );
      })}
    </div>
  );
}