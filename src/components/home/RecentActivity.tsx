import { Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Panel } from "@/components/ui/Panel";
import type { ActivityItem } from "@/hooks/useHomeData";
import { formatTimeAgo } from "@/utils/format";

const DOT: Record<ActivityItem["kind"], string> = {
  job: "bg-flag-green shadow-[0_0_10px_var(--color-flag-green)]",
  project: "bg-flag-blue shadow-[0_0_10px_var(--color-flag-blue)]",
};

export function RecentActivity({ items, loading }: { items: ActivityItem[]; loading: boolean }) {
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
          <Activity className="size-6 text-flag-yellow" /> Atividade Recente
        </h2>
        <Link to="/vagas" className="flex items-center gap-1 text-sm font-medium text-flag-blue hover:text-white">
          Ver mais <ArrowRight className="size-4" />
        </Link>
      </div>

      {items.length > 0 ? (
        <ol className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/15">
          {items.map((item) => (
            <li key={item.id} className="relative pl-8">
              <span className={`absolute left-0 top-1.5 size-[15px] rounded-full ${DOT[item.kind]}`} aria-hidden />
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
          ))}
        </ol>
      ) : (
        <p className="py-16 text-center text-sm text-slate-500">{loading ? "Carregando..." : "Sem atividade recente."}</p>
      )}
    </Panel>
  );
}