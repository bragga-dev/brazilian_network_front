import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { formatLocation, formatRelative, formatSalary } from "@/utils/format";
import type { Job } from "@/types/job";

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);

  return (
    <article className="group relative border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-flag-green/60 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/vagas/${job.job_id}`}
            className="block truncate text-lg font-medium text-white after:absolute after:inset-0 group-hover:text-flag-yellow"
          >
            {job.title}
          </Link>
          <Link
            to={`/empresas/${job.company.company_id}`}
            className="relative z-10 mt-0.5 inline-block text-sm text-slate-400 hover:text-flag-green"
          >
            {job.company.full_name}
          </Link>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          {formatRelative(job.published_at)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="green">{job.contract_type_label}</Badge>
        <Badge tone="blue">{job.work_model_label}</Badge>
        <Badge>{job.experience_level_label}</Badge>
        {job.technologies.slice(0, 4).map((item) => (
          <Badge key={item.technology.technology_id} tone="yellow">
            {item.technology.name}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-sm">
        <span className="text-slate-400">{formatLocation(job)}</span>
        <span className={salary === "A combinar" ? "text-slate-500" : "font-medium text-white"}>{salary}</span>
      </div>
    </article>
  );
}
