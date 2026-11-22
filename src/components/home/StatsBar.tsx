import type { LucideIcon } from "lucide-react";

import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { STAT_ICONS } from "@/constants/icons";
import type { HomeStats } from "@/types/home";
import { formatNumber } from "@/utils/format";

const ITEMS: { key: keyof HomeStats; label: string; icon: LucideIcon; color: string }[] = [
  { key: "open_jobs", label: "Vagas Abertas", icon: STAT_ICONS.jobs, color: "text-brand-purple" },
  { key: "companies", label: "Empresas Parceiras", icon: STAT_ICONS.companies, color: "text-flag-blue" },
  { key: "devs", label: "Devs na Rede", icon: STAT_ICONS.devs, color: "text-flag-green" },
  { key: "open_projects", label: "Projetos Freelancer", icon: STAT_ICONS.projects, color: "text-flag-yellow" },
];

export function StatsBar({ stats }: { stats: HomeStats | undefined }) {
  return (
    <Panel className="grid grid-cols-2 divide-white/10 py-2 lg:grid-cols-4 lg:divide-x">
      {ITEMS.map(({ key, label, icon, color }) => (
        <div key={key} className="flex items-center gap-4 px-6 py-4">
          <Icon icon={icon} size="xl" className={color} />
          <div>
            <p className="text-3xl font-bold leading-none text-white">{stats ? formatNumber(stats[key]) : "—"}</p>
            <p className="mt-1.5 text-sm text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </Panel>
  );
}