import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { Icon } from "@/components/ui/Icon";
import { LockedNotice } from "@/components/ui/LockedNotice";
import { TechBadge } from "@/components/ui/TechBadge";
import { CONTRACT_ICONS, EXPERIENCE_ICONS, WORK_MODEL_ICONS } from "@/constants/icons";
import { formatLocation, formatRelative, formatSalary } from "@/utils/format";
import type { Job } from "@/types/job";

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);

  return (
    <article className="group relative rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] p-5 transition hover:border-flag-green/50 hover:from-white/[0.07]">
      <div className="flex items-start gap-4">
        <PatriotAvatar shape="square" name={job.company.full_name} url={job.company.photo_url} patriot={job.company.is_patriot} className="size-12" textClassName="text-lg" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/vagas/${job.job_id}`}
            className="block truncate text-lg font-semibold text-white after:absolute after:inset-0 group-hover:text-flag-green"
          >
            {job.title}
          </Link>
          <div className="relative z-10 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link to={`/empresas/${job.company.company_id}`} className="text-sm text-slate-400 hover:text-flag-green">
              {job.company.full_name}
            </Link>
            {job.company.is_patriot && <PatriotBadge />}
          </div>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{formatRelative(job.published_at)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="green" icon={<Icon icon={CONTRACT_ICONS[job.contract_type]} size="xs" />}>
          {job.contract_type_label}
        </Badge>
        <Badge tone="purple" icon={<Icon icon={WORK_MODEL_ICONS[job.work_model]} size="xs" />}>
          {job.work_model_label}
        </Badge>
        <Badge icon={<Icon icon={EXPERIENCE_ICONS[job.experience_level]} size="xs" />}>{job.experience_level_label}</Badge>
        {job.areas.map((area) => (
          <Badge key={area.work_area_id} tone="blue">
            {area.name}
          </Badge>
        ))}
        {job.technologies.slice(0, 4).map((item) => (
          <TechBadge key={item.technology.technology_id} technology={item.technology} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
        <span className="text-slate-400">{formatLocation(job)}</span>
        {job.locked ? (
          <LockedNotice compact>Entre para ver a remuneração</LockedNotice>
        ) : (
          <span className={salary === "A combinar" ? "text-slate-500" : "font-semibold text-white"}>{salary}</span>
        )}
      </div>
    </article>
  );
}