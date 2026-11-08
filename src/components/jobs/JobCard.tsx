import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { formatLocation, formatRelative, formatSalary } from "@/utils/format";
import type { Job } from "@/types/job";

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);

  return (
    <article className="group relative rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] p-5 transition hover:border-flag-green/50 hover:from-white/[0.07]">
      <div className="flex items-start gap-4">
        <CompanyLogo name={job.company.full_name} url={job.company.photo_url} className="size-12 text-lg" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/vagas/${job.job_id}`}
            className="block truncate text-lg font-semibold text-white after:absolute after:inset-0 group-hover:text-flag-green"
          >
            {job.title}
          </Link>
          <Link to={`/empresas/${job.company.company_id}`} className="relative z-10 mt-0.5 inline-block text-sm text-slate-400 hover:text-flag-green">
            {job.company.full_name}
          </Link>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{formatRelative(job.published_at)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="green">{job.contract_type_label}</Badge>
        <Badge tone="purple">{job.work_model_label}</Badge>
        <Badge>{job.experience_level_label}</Badge>
        {job.technologies.slice(0, 4).map((item) => (
          <Badge key={item.technology.technology_id} tone="blue">
            {item.technology.name}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
        <span className="text-slate-400">{formatLocation(job)}</span>
        <span className={salary === "A combinar" ? "text-slate-500" : "font-semibold text-white"}>{salary}</span>
      </div>
    </article>
  );
}