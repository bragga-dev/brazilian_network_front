import { Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";

/** Aviso dos conteúdos reservados (descrição, remuneração...): o back só entrega o cartão a visitantes. */
export function LockedNotice({ children, compact = false }: { children: string; compact?: boolean }) {
  const { status } = useAuth();
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="size-3.5" aria-hidden /> {children}
      </span>
    );
  }

  return (
    <Panel className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 size-5 shrink-0 text-flag-yellow" aria-hidden />
        <p className="text-sm text-slate-300">{children}</p>
      </div>
      {status === "anonymous" && (
        <div className="flex shrink-0 gap-2">
          <Link to="/entrar" state={{ from }} className={buttonClasses("primary", "sm")}>
            Entrar
          </Link>
          <Link to="/cadastro" className={buttonClasses("secondary", "sm")}>
            Criar conta
          </Link>
        </div>
      )}
    </Panel>
  );
}