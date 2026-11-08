import { useEffect, useState } from "react";

import { Field, Input, Select } from "@/components/ui/Field";
import { CONTRACT_OPTIONS, EXPERIENCE_OPTIONS, ORDER_OPTIONS, STATES, WORK_MODEL_OPTIONS } from "@/constants/jobOptions";
import { useDebounce } from "@/hooks/useDebounce";
import type { JobFilters as Filters, JobOrder } from "@/types/job";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  hasActive: boolean;
}

export function JobFilters({ filters, onChange, onClear, hasActive }: Props) {
  // Campos de texto têm estado local + debounce para não disparar request a cada tecla.
  const [q, setQ] = useState(filters.q ?? "");
  const [city, setCity] = useState(filters.city ?? "");
  const [salary, setSalary] = useState(filters.salary_min ?? "");
  const dq = useDebounce(q);
  const dcity = useDebounce(city);
  const dsalary = useDebounce(salary);

  useEffect(() => {
    if (dq !== (filters.q ?? "")) onChange({ q: dq });
  }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (dcity !== (filters.city ?? "")) onChange({ city: dcity });
  }, [dcity]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (dsalary !== (filters.salary_min ?? "")) onChange({ salary_min: dsalary });
  }, [dsalary]); // eslint-disable-line react-hooks/exhaustive-deps

  const clear = () => {
    setQ("");
    setCity("");
    setSalary("");
    onClear();
  };

  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:self-start">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-flag-green">Filtros</p>
        {hasActive && (
          <button onClick={clear} className="text-xs text-slate-400 hover:text-flag-yellow">
            Limpar
          </button>
        )}
      </div>

      <Field label="Buscar">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título ou descrição" />
      </Field>

      <Field label="Contratação">
        <Select value={filters.contract_type ?? ""} onChange={(e) => onChange({ contract_type: e.target.value as Filters["contract_type"] })}>
          <option value="">Todas</option>
          {CONTRACT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Modelo de trabalho">
        <Select value={filters.work_model ?? ""} onChange={(e) => onChange({ work_model: e.target.value as Filters["work_model"] })}>
          <option value="">Todos</option>
          {WORK_MODEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Nível">
        <Select
          value={filters.experience_level ?? ""}
          onChange={(e) => onChange({ experience_level: e.target.value as Filters["experience_level"] })}
        >
          <option value="">Todos</option>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Estado">
          <Select value={filters.state ?? ""} onChange={(e) => onChange({ state: e.target.value })}>
            <option value="">Todos</option>
            {STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cidade">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Salvador" />
        </Field>
      </div>

      <Field label="Remuneração mínima (R$)" hint="Vagas com remuneração oculta não entram no filtro.">
        <Input type="number" min={0} inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Ex.: 5000" />
      </Field>

      <Field label="Ordenar por">
        <Select value={filters.order_by ?? "-published_at"} onChange={(e) => onChange({ order_by: e.target.value as JobOrder })}>
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
    </aside>
  );
}