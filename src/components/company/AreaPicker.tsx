import { useAreas } from "@/hooks/useAreas";
import { cn } from "@/utils/cn";

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

/** Até `max` áreas de atuação (o backend limita a 3). Os ids vêm de `/profile/catalog/areas`. */
export function AreaPicker({ value, onChange, max = 3 }: Props) {
  const { data: areas = [], isLoading } = useAreas();

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((item) => item !== id));
    else if (value.length < max) onChange([...value, id]);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-300">
        Áreas de atuação <span className="text-slate-500">({value.length}/{max})</span>
      </p>
      {isLoading && <p className="text-sm text-slate-500">Carregando áreas...</p>}
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => {
          const selected = value.includes(area.work_area_id);
          const blocked = !selected && value.length >= max;
          return (
            <button
              key={area.work_area_id}
              type="button"
              aria-pressed={selected}
              disabled={blocked}
              onClick={() => toggle(area.work_area_id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                selected ? "border-flag-blue/60 bg-flag-blue/15 text-blue-200" : "border-white/15 text-slate-300 hover:border-white/40",
              )}
            >
              {area.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}