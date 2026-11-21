import { Check, Circle } from "lucide-react";

import { Panel } from "@/components/ui/Panel";

export interface CompletenessItem {
  label: string;
  done: boolean;
  /** Obrigatório (dev: regra do backend para se candidatar). Sem isso, é só recomendação. */
  required?: boolean;
}

export interface Completeness {
  percent: number;
  items: CompletenessItem[];
}

export function buildCompleteness(items: CompletenessItem[]): Completeness {
  const done = items.filter((item) => item.done).length;
  return { percent: Math.round((done / items.length) * 100), items };
}

function ItemList({ items }: { items: CompletenessItem[] }) {
  return (
    <ul className="mt-2 space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.label} className={`flex items-center gap-2 ${item.done ? "text-slate-300" : "text-slate-500"}`}>
          {item.done ? <Check className="size-4 text-flag-green" /> : <Circle className="size-4" />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function CompletenessCard({ completeness, requiredTitle = "Obrigatório" }: { completeness: Completeness; requiredTitle?: string }) {
  const required = completeness.items.filter((item) => item.required);
  const optional = completeness.items.filter((item) => !item.required);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-white">Perfil completo</h2>
        <span className="text-2xl font-bold text-flag-green">{completeness.percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={completeness.percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-linear-to-r from-flag-green to-flag-yellow transition-all" style={{ width: `${completeness.percent}%` }} />
      </div>

      {required.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-flag-yellow">{requiredTitle}</p>
          <ItemList items={required} />
        </div>
      )}
      {optional.length > 0 && (
        <div className="mt-4">
          {required.length > 0 && <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recomendado</p>}
          <ItemList items={optional} />
        </div>
      )}
    </Panel>
  );
}