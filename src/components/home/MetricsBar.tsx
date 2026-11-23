import { CalendarDays, Radio, Users, type LucideIcon } from "lucide-react";

import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { usePublicMetrics } from "@/hooks/useMetrics";
import type { PublicMetrics } from "@/types/metrics";
import { formatNumber } from "@/utils/format";

const ITEMS: { key: keyof PublicMetrics; label: string; icon: LucideIcon; color: string }[] = [
  { key: "online_now", label: "Online agora", icon: Radio, color: "text-flag-green" },
  { key: "visitors_today", label: "Visitantes hoje", icon: Users, color: "text-flag-blue" },
  { key: "visitors_last_7_days", label: "Últimos 7 dias", icon: CalendarDays, color: "text-brand-purple" },
  { key: "visitors_last_30_days", label: "Últimos 30 dias", icon: CalendarDays, color: "text-flag-yellow" },
];

export function MetricsBar() {
  const { data } = usePublicMetrics();

  return (
    <Panel className="grid grid-cols-2 divide-white/10 py-1 lg:grid-cols-4 lg:divide-x">
      {ITEMS.map(({ key, label, icon, color }) => (
        <div key={key} className="flex items-center gap-3 px-6 py-3">
          <Icon icon={icon} size="md" className={color} />
          <p className="text-sm text-slate-400">
            <span className="mr-1.5 text-lg font-semibold text-white">{data ? formatNumber(data[key]) : "—"}</span>
            {label}
          </p>
        </div>
      ))}
    </Panel>
  );
}