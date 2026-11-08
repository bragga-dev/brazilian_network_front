import type { ReactNode } from "react";

import { Panel } from "./Panel";

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span className="size-4 animate-spin rounded-full border-2 border-white/15 border-t-flag-green" />
      <span className="text-sm">{label}...</span>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Panel className="px-6 py-14 text-center">
      <p className="text-lg font-medium text-white">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-400">{children}</div>}
    </Panel>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Panel className="border-red-500/30 px-6 py-14 text-center">
      <p className="text-lg font-medium text-white">Não foi possível carregar</p>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-full border border-white/15 px-5 py-2 text-sm text-white hover:border-flag-green hover:text-flag-green"
        >
          Tentar novamente
        </button>
      )}
    </Panel>
  );
}