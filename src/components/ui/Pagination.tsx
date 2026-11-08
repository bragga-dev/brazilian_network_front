import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

const BTN =
  "border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300 " +
  "hover:border-flag-green hover:text-flag-green disabled:pointer-events-none disabled:opacity-30";

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-between gap-3">
      <button className={BTN} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Anterior
      </button>
      <span className={cn("font-mono text-[11px] uppercase tracking-widest text-slate-500")}>
        Página <span className="text-white">{page}</span> de {pages}
      </span>
      <button className={BTN} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Próxima →
      </button>
    </nav>
  );
}
