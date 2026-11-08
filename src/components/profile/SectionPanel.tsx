import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export function SectionPanel({ title, hint, addLabel, onAdd, children, empty }: {
  title: string;
  hint?: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
  empty?: string;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="size-4" /> {addLabel}
        </Button>
      </div>
      {empty ? <p className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">{empty}</p> : <div className="mt-5 grid gap-3 xl:grid-cols-2">{children}</div>}
    </Panel>
  );
}

const ICON_BTN = "rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white";

export function ItemActions({ active, onToggle, onEdit, onDelete }: { active?: boolean; onToggle?: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 items-center">
      {onToggle && (
        <button onClick={onToggle} className={ICON_BTN} aria-label={active ? "Ocultar do perfil público" : "Mostrar no perfil público"} title={active ? "Visível no perfil público" : "Oculto do perfil público"}>
          {active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      )}
      <button onClick={onEdit} className={ICON_BTN} aria-label="Editar">
        <Pencil className="size-4" />
      </button>
      <button onClick={onDelete} className={`${ICON_BTN} hover:text-red-400`} aria-label="Excluir">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}