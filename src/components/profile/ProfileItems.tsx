import { Award, ExternalLink, GraduationCap, Briefcase } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import type { Course, Education, Experience } from "@/types/profile";
import { formatMonthYear, formatPeriod } from "@/utils/format";

function ItemShell({ icon, title, subtitle, period, badges, description, actions, dimmed }: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  period?: string;
  badges?: ReactNode;
  description?: string;
  actions?: ReactNode;
  dimmed?: boolean;
}) {
  return (
    <article className={`flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 ${dimmed ? "opacity-50" : ""}`}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-flag-green">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">{title}</h3>
            <p className="truncate text-sm text-slate-400">{subtitle}</p>
          </div>
          {actions}
        </div>
        {(period || badges) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {period && <span className="text-xs text-slate-500">{period}</span>}
            {badges}
          </div>
        )}
        {description && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-400">{description}</p>}
      </div>
    </article>
  );
}

export function EducationCard({ item, actions }: { item: Education; actions?: ReactNode }) {
  return (
    <ItemShell
      icon={<GraduationCap className="size-5" />}
      title={item.course}
      subtitle={item.institution}
      period={formatPeriod(item.start_date, item.end_date, item.status === "in_progress" && !item.end_date)}
      badges={
        <>
          <Badge tone="purple">{item.education_level_label}</Badge>
          <Badge tone={item.status === "completed" ? "green" : "neutral"}>{item.status_label}</Badge>
        </>
      }
      description={item.description}
      actions={actions}
      dimmed={!item.is_active}
    />
  );
}

export function ExperienceCard({ item, actions }: { item: Experience; actions?: ReactNode }) {
  return (
    <ItemShell
      icon={<Briefcase className="size-5" />}
      title={item.position}
      subtitle={item.company}
      period={formatPeriod(item.start_date, item.end_date, item.is_current)}
      badges={
        <>
          <Badge tone="blue">{item.employment_type_label}</Badge>
          {item.is_current && <Badge tone="green">Atual</Badge>}
        </>
      }
      description={item.description}
      actions={actions}
      dimmed={!item.is_active}
    />
  );
}

export function CourseCard({ item, actions }: { item: Course; actions?: ReactNode }) {
  const done = item.completion_date ? `Concluído em ${formatMonthYear(item.completion_date)}` : "";
  return (
    <ItemShell
      icon={<Award className="size-5" />}
      title={item.name}
      subtitle={item.provider}
      period={[done, item.workload ? `${item.workload} h` : ""].filter(Boolean).join(" · ")}
      badges={
        <>
          <Badge tone="yellow">{item.course_type_label}</Badge>
          <Badge tone={item.status === "completed" ? "green" : "neutral"}>{item.status_label}</Badge>
          {item.certificate_url && (
            <a href={item.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-flag-blue hover:text-white">
              Certificado <ExternalLink className="size-3" />
            </a>
          )}
        </>
      }
      description={item.description}
      actions={actions}
      dimmed={!item.is_active}
    />
  );
}