import { Plus, Search, X } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/Field";
import { TechIcon } from "@/components/ui/TechIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { useTechnologyCatalog } from "@/hooks/useProfile";
import type { JobTechnology } from "@/types/job";

interface Props {
  value: JobTechnology[];
  onChange: (items: JobTechnology[]) => void;
  max?: number;
}

/** Tecnologias da vaga/projeto, cada uma obrigatória ou desejável (o backend limita a 20). */
export function TechnologyPicker({ value, onChange, max = 20 }: Props) {
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const catalog = useTechnologyCatalog(dq, "");
  const selected = new Set(value.map((item) => item.technology.technology_id));
  const results = (catalog.data?.items ?? []).filter((technology) => !selected.has(technology.technology_id)).slice(0, 8);

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-300">
        Tecnologias <span className="text-slate-500">({value.length}/{max})</span>
      </p>

      {value.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {value.map((item) => (
            <li key={item.technology.technology_id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <TechIcon name={item.technology.name} categories={item.technology.categories.map((c) => c.name)} className="size-4" />
              <span className="flex-1 truncate text-sm text-white">{item.technology.name}</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <input
                  type="checkbox"
                  className="size-3.5 accent-flag-green"
                  checked={item.is_required}
                  onChange={(e) =>
                    onChange(value.map((entry) => (entry.technology.technology_id === item.technology.technology_id ? { ...entry, is_required: e.target.checked } : entry)))
                  }
                />
                Obrigatória
              </label>
              <button
                type="button"
                aria-label={`Remover ${item.technology.name}`}
                onClick={() => onChange(value.filter((entry) => entry.technology.technology_id !== item.technology.technology_id))}
                className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < max && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" placeholder="Buscar tecnologia para adicionar" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {results.map((technology) => (
              <li key={technology.technology_id}>
                <button
                  type="button"
                  onClick={() => onChange([...value, { technology, is_required: true }])}
                  className="flex items-center gap-1 rounded-full border border-flag-green/40 px-3 py-1 text-xs font-medium text-flag-green hover:bg-flag-green/10"
                >
                  <Plus className="size-3.5" /> {technology.name}
                </button>
              </li>
            ))}
            {!catalog.isLoading && results.length === 0 && <li className="text-xs text-slate-500">Nenhuma tecnologia encontrada.</li>}
          </ul>
        </>
      )}
    </div>
  );
}