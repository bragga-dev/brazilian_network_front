import { ArrowRight, UserRoundPen, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { getRequiredCompletion } from "@/utils/profileCompletion";

/** Faixa fixa abaixo do header enquanto faltarem dados obrigatórios. Some em /perfil e pode ser dispensada na sessão. */
export function ProfileCompletionBanner() {
  const { status, me } = useAuth();
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(false);

  if (status !== "authenticated" || !me || dismissed || pathname.startsWith("/perfil")) return null;
  const pending = getRequiredCompletion(me);
  if (!pending) return null;

  return (
    <div role="status" className="border-b border-flag-yellow/30 bg-flag-yellow/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 text-sm text-flag-yellow sm:px-6">
        <Icon icon={UserRoundPen} size="md" />
        <p className="min-w-0 flex-1">{pending.message}</p>
        <Link to={`/perfil?aba=${pending.tab}`} className="flex shrink-0 items-center gap-1 font-semibold underline-offset-2 hover:underline">
          Completar agora <Icon icon={ArrowRight} />
        </Link>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dispensar aviso" className="shrink-0 rounded p-1 hover:bg-white/10">
          <Icon icon={X} />
        </button>
      </div>
    </div>
  );
}