import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { TechIcon } from "@/components/ui/TechIcon";
import { CONTRACT_ICONS, WORK_MODEL_ICONS } from "@/constants/icons";
import type { HomeJob } from "@/types/home";
import { formatLocation } from "@/utils/format";

function JobRow({ job }: { job: HomeJob }) {
  return (
    <li>
      <Link to={`/vagas/${job.job_id}`} className="group flex items-center gap-4 py-4 transition hover:bg-white/[0.03] sm:-mx-3 sm:rounded-xl sm:px-3">
        <PatriotAvatar shape="square" name={job.company.full_name} url={job.company.photo_url} patriot={job.company.is_patriot} className="size-14" textClassName="text-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white group-hover:text-flag-green">{job.title}</p>
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <span className="truncate">
              {job.company.full_name} · {formatLocation(job)}
            </span>
            {job.company.is_patriot && <PatriotBadge className="shrink-0" />}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.technologies.slice(0, 3).map((name) => (
              <Badge key={name} tone="blue" icon={<TechIcon name={name} />}>
                {name}
              </Badge>
            ))}
            <Badge tone="neutral" icon={<Icon icon={WORK_MODEL_ICONS[job.work_model]} size="xs" />}>
              {job.work_model_label}
            </Badge>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-2 text-right xl:flex">
          <Badge tone="green" icon={<Icon icon={CONTRACT_ICONS[job.contract_type]} size="xs" />}>
            {job.contract_type_label}
          </Badge>
          <span className="text-xs text-slate-500">{job.experience_level_label}</span>
        </div>
      </Link>
    </li>
  );
}

export function FeaturedJobs({ jobs, loading }: { jobs: HomeJob[]; loading: boolean }) {
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