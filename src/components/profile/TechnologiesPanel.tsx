import { Eye, EyeOff, Plus, Search, X } from "lucide-react";
import { useState } from "react";

import { FormMessage } from "@/components/layout/AuthShell";
import { Input, Select } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { PROFICIENCY_OPTIONS } from "@/constants/profileOptions";
import { useDebounce } from "@/hooks/useDebounce";
import { useProfileMutation, useTechnologyCatalog, useTechnologyCategories } from "@/hooks/useProfile";
import { profileService } from "@/services/profile.service";
import type { DevTechnology, Proficiency } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";

function TechRow({ item }: { item: DevTechnology }) {
  const update = useProfileMutation(profileService.technologies.update);
  const remove = useProfileMutation(profileService.technologies.remove);
  const [years, setYears] = useState(String(item.years_experience));
  const id = item.dev_technology_id;

  const commitYears = () => {
    const value = Math.min(60, Math.max(0, Number(years) || 0));
    setYears(String(value));
    if (value !== item.years_experience) update.mutate({ id, data: { years_experience: value } });
  };

  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 ${item.is_active ? "" : "opacity-50"}`}>
      <div className="min-w-32 flex-1">
        <p className="font-medium text-white">{item.technology.name}</p>
        <p className="truncate text-xs text-slate-500">{item.technology.categories.map((c) => c.name).join(" · ")}</p>
      </div>
      <Select
        aria-label={`Nível em ${item.technology.name}`}
        className="w-40"
        value={item.proficiency}
        onChange={(e) => update.mutate({ id, data: { proficiency: e.target.value as Proficiency } })}
      >
        {PROFICIENCY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <Input
          aria-label={`Anos de experiência em ${item.technology.name}`}
          type="number"
          min={0}
          max={60}
          className="w-16"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          onBlur={commitYears}
        />
        anos
      </label>
      <div className="flex items-center">
        <button
          onClick={() => update.mutate({ id, data: { is_active: !item.is_active } })}
          aria-label={item.is_active ? "Ocultar do perfil público" : "Mostrar no perfil público"}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
        >
          {item.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button onClick={() => remove.mutate(id)} aria-label={`Remover ${item.technology.name}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-red-400">
          <X className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function TechnologiesPanel({ items }: { items: DevTechnology[] }) {
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const dq = useDebounce(q);
  const catalog = useTechnologyCatalog(dq, categoryId);
  const categories = useTechnologyCategories();
  const add = useProfileMutation(profileService.technologies.create);
  const [error, setError] = useState<string | null>(null);

  const owned = new Set(items.map((item) => item.technology.technology_id));
  const results = (catalog.data?.items ?? []).filter((tech) => !owned.has(tech.technology_id));

  const addTech = async (technologyId: string) => {
    setError(null);
    try {
      await add.mutateAsync({ technology_id: technologyId, proficiency: "beginner", years_experience: 0 });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível adicionar a tecnologia."));
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Panel className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Minhas tecnologias</h2>
        <p className="mt-1 text-sm text-slate-500">Defina seu nível e anos de experiência em cada uma.</p>
        {items.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">Adicione tecnologias pelo catálogo ao lado.</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {items.map((item) => (
              <TechRow key={item.dev_technology_id} item={item} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="p-5 sm:p-6 lg:self-start">
        <h2 className="text-lg font-semibold text-white">Catálogo</h2>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input className="pl-9" placeholder="Buscar tecnologia" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select aria-label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas as categorias</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.technology_category_id} value={c.technology_category_id}>{c.name}</option>
            ))}
          </Select>
        </div>
        {error && (
          <div className="mt-3">
            <FormMessage tone="error">{error}</FormMessage>
          </div>
        )}
        <ul className="mt-4 max-h-96 space-y-1.5 overflow-y-auto pr-1">
          {results.map((tech) => (
            <li key={tech.technology_id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white/5">
              <span className="min-w-0">
                <span className="block truncate text-sm text-white">{tech.name}</span>
                <span className="block truncate text-xs text-slate-500">{tech.categories.map((c) => c.name).join(" · ")}</span>
              </span>
              <button onClick={() => void addTech(tech.technology_id)} disabled={add.isPending} className="flex shrink-0 items-center gap-1 rounded-full border border-flag-green/40 px-3 py-1 text-xs font-medium text-flag-green hover:bg-flag-green/10 disabled:opacity-50">
                <Plus className="size-3.5" /> Adicionar
              </button>
            </li>
          ))}
          {catalog.isLoading && <li className="py-6 text-center text-sm text-slate-500">Carregando...</li>}
          {!catalog.isLoading && results.length === 0 && <li className="py-6 text-center text-sm text-slate-500">Nenhuma tecnologia encontrada.</li>}
        </ul>
      </Panel>
    </div>
  );
}