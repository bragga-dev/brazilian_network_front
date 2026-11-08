import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

const BTN =
  "rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 " +
  "hover:border-flag-green hover:text-flag-green disabled:pointer-events-none disabled:opacity-30";

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-between gap-3">
      <button className={BTN} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Anterior
      </button>
      <span className={cn("text-sm text-slate-500")}>
        Página <span className="text-white">{page}</span> de {pages}
      </span>
      <button className={BTN} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Próxima →
      </button>
    </nav>
  );
}