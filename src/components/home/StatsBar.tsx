import { TrendingUp, type LucideIcon } from "lucide-react";

import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { STAT_ICONS } from "@/constants/icons";
import { formatNumber } from "@/utils/format";

interface Stats {
  jobs?: number;
  companies?: number;
  hiring?: number;
  projects?: number;
}

const ITEMS: { key: keyof Stats; label: string; icon: LucideIcon; color: string }[] = [
  { key: "jobs", label: "Vagas Disponíveis", icon: STAT_ICONS.jobs, color: "text-brand-purple" },
  { key: "companies", label: "Empresas Parceiras", icon: STAT_ICONS.companies, color: "text-flag-blue" },
  { key: "hiring", label: "Empresas Contratando", icon: TrendingUp, color: "text-flag-green" },
  { key: "projects", label: "Projetos Freelancer", icon: STAT_ICONS.projects, color: "text-flag-yellow" },
];

export function StatsBar({ stats }: { stats: Stats }) {
  return (
    <Panel className="grid grid-cols-2 divide-white/10 py-2 lg:grid-cols-4 lg:divide-x">
      {ITEMS.map(({ key, label, icon, color }) => (
        <div key={key} className="flex items-center gap-4 px-6 py-4">
          <Icon icon={icon} size="xl" className={color} />
          <div>
            <p className="text-3xl font-bold leading-none text-white">{stats[key] === undefined ? "—" : formatNumber(stats[key])}</p>
            <p className="mt-1.5 text-sm text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </Panel>
  );
}