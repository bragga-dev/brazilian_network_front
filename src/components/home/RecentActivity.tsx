import { Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { ACTIVITY_ICONS } from "@/constants/icons";
import type { ActivityItem } from "@/hooks/useHomeData";
import { formatTimeAgo } from "@/utils/format";

export function RecentActivity({ items, loading }: { items: ActivityItem[]; loading: boolean }) {
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
          <Icon icon={Activity} size="lg" className="text-flag-yellow" /> Atividade Recente
        </h2>
        <Link to="/vagas" className="flex items-center gap-1 text-sm font-medium text-flag-blue hover:text-white">
          Ver mais <Icon icon={ArrowRight} />
        </Link>
      </div>

      {items.length > 0 ? (
        <ol className="relative mt-5 space-y-5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-white/15">
          {items.map((item) => {
            const { icon, className } = ACTIVITY_ICONS[item.kind];
            return (
              <li key={item.id} className="relative pl-12">
                <span className={`absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border ${className}`} aria-hidden>
                  <Icon icon={icon} />
                </span>
                <Link to={item.to} className="flex items-start justify-between gap-3 hover:text-flag-green">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">{item.title}</span>
                    <span className="block truncate text-sm text-slate-400">{item.description}</span>
                  </span>
                  <time dateTime={item.at} className="shrink-0 text-xs text-slate-500">
                    {formatTimeAgo(item.at)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="py-16 text-center text-sm text-slate-500">{loading ? "Carregando..." : "Sem atividade recente."}</p>
      )}
    </Panel>
  );
}