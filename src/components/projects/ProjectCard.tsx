import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import type { Project } from "@/types/project";
import { formatProjectValue, formatRelative } from "@/utils/format";

export function ProjectCard({ project }: { project: Project }) {
  const value = formatProjectValue(project);

  return (
    <article className="rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo name={project.company.full_name} url={project.company.photo_url} className="size-12 text-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white">{project.title}</h3>
          <Link to={`/empresas/${project.company.company_id}`} className="mt-0.5 inline-block text-sm text-slate-400 hover:text-flag-green">
            {project.company.full_name}
          </Link>
        </div>
        <span className="shrink-0 text-xs text-slate-500">{formatRelative(project.published_at)}</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="purple">{project.experience_level_label}</Badge>
        {project.technologies.slice(0, 5).map((item) => (
          <Badge key={item.technology.technology_id} tone="blue">
            {item.technology.name}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Clock className="size-4" /> {project.estimated_duration_days} {project.estimated_duration_days === 1 ? "dia" : "dias"}
        </span>
        <span className={value === "A combinar" ? "text-slate-500" : "font-semibold text-white"}>{value}</span>
      </div>
    </article>
  );
}