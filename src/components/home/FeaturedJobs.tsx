import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { Panel } from "@/components/ui/Panel";
import type { Job } from "@/types/job";
import { formatSalary } from "@/utils/format";

function JobRow({ job }: { job: Job }) {
  const salary = formatSalary(job);
  return (
    <li>
      <Link to={`/vagas/${job.job_id}`} className="group flex items-center gap-4 py-4 transition hover:bg-white/[0.03] sm:-mx-3 sm:rounded-xl sm:px-3">
        <CompanyLogo name={job.company.full_name} url={job.company.photo_url} className="size-14 text-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white group-hover:text-flag-green">{job.title}</p>
          <p className="truncate text-sm text-slate-400">{job.company.full_name}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.technologies.slice(0, 3).map((item) => (
              <Badge key={item.technology.technology_id} tone="blue">
                {item.technology.name}
              </Badge>
            ))}
            <Badge tone="neutral">{job.work_model_label}</Badge>
          </div>
          <p className="mt-2 text-xs font-semibold text-white xl:hidden">{salary === "A combinar" ? "" : salary}</p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-2 text-right xl:flex">
          <Badge tone="green">{job.contract_type_label}</Badge>
          <span className={salary === "A combinar" ? "text-xs text-slate-500" : "text-xs font-semibold text-white"}>{salary}</span>
        </div>
      </Link>
    </li>
  );
}

export function FeaturedJobs({ jobs, loading }: { jobs: Job[]; loading: boolean }) {
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
          <Briefcase className="size-6 text-brand-purple" /> Vagas em Destaque
        </h2>
        <Link to="/vagas" className="flex items-center gap-1 text-sm font-medium text-flag-blue hover:text-white">
          Ver todas <ArrowRight className="size-4" />
        </Link>
      </div>

      {jobs.length > 0 ? (
        <ul className="mt-3 divide-y divide-white/10 border-t border-white/10">
          {jobs.map((job) => (
            <JobRow key={job.job_id} job={job} />
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-sm text-slate-500">{loading ? "Carregando..." : "Nenhuma vaga publicada ainda."}</p>
      )}
    </Panel>
  );
}