import { Link, useParams } from "react-router-dom";

import { ApplyAction } from "@/components/applications/ApplyAction";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { PatriotBadge } from "@/components/ui/PatriotBadge";
import { Icon } from "@/components/ui/Icon";
import { LockedNotice } from "@/components/ui/LockedNotice";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { ErrorState, Spinner } from "@/components/ui/States";
import { TechBadge } from "@/components/ui/TechBadge";
import { EXPERIENCE_ICONS } from "@/constants/icons";
import { useProject } from "@/hooks/useProjects";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { formatProjectValue, formatRelative } from "@/utils/format";

function TextBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <section className="mt-8">
      <SectionLabel tone="muted">{title}</SectionLabel>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300">{text}</p>
    </section>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);

  if (isLoading) return <Spinner />;
  if (isError || !project) {
    const notFound = getStatus(error) === 404 || getStatus(error) === 422;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          message={notFound ? "Este projeto não existe mais ou foi encerrado." : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => void refetch()}
        />
        <Link to="/projetos" className={buttonClasses("secondary", "md", "mt-6")}>
          ← Voltar para os projetos
        </Link>
      </div>
    );
  }

  const required = project.technologies.filter((t) => t.is_required);
  const optional = project.technologies.filter((t) => !t.is_required);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <Link to="/projetos" className="text-sm text-slate-400 hover:text-white">
        ← Projetos
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple" icon={<Icon icon={EXPERIENCE_ICONS[project.experience_level]} size="xs" />}>
              {project.experience_level_label}
            </Badge>
            {project.areas.map((area) => (
              <Badge key={area.work_area_id} tone="blue">
                {area.name}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{project.title}</h1>
          <p className="mt-2 text-slate-400">Publicado {formatRelative(project.published_at)}</p>

          {project.locked ? (
            <div className="mt-8">
              <LockedNotice>Entre na sua conta verificada para ler a descrição, os requisitos, o valor e o prazo deste projeto.</LockedNotice>
            </div>
          ) : (
            <>
              <TextBlock title="Sobre o projeto" text={project.description} />
              <TextBlock title="Requisitos" text={project.requirements} />
            </>
          )}

          {project.technologies.length > 0 && (
            <section className="mt-8">
              <SectionLabel tone="muted">Stack</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {required.map((t) => (
                  <TechBadge key={t.technology.technology_id} technology={t.technology} />
                ))}
                {optional.map((t) => (
                  <TechBadge key={t.technology.technology_id} technology={t.technology} suffix=" · desejável" tone="neutral" />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Panel className="p-5">
            <SectionLabel tone="yellow">Orçamento</SectionLabel>
            {project.locked ? (
              <p className="mt-3 text-sm text-slate-400">Disponível após o login.</p>
            ) : (
              <>
                <p className="mt-3 text-2xl font-semibold text-white">{formatProjectValue(project)}</p>
                {project.estimated_duration_days !== null && (
                  <p className="mt-3 text-sm text-slate-400">
                    Duração estimada: {project.estimated_duration_days} {project.estimated_duration_days === 1 ? "dia" : "dias"}
                  </p>
                )}
              </>
            )}
            <ApplyAction kind="project" target={{ id: project.project_id, title: project.title }} />
          </Panel>

          <Panel className="p-5">
            <SectionLabel tone="blue">Empresa</SectionLabel>
            <Link to={`/empresas/${project.company.company_id}`} className="group -mx-2 mt-3 flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]">
              <PatriotAvatar shape="square" name={project.company.full_name} url={project.company.photo_url} patriot={project.company.is_patriot} className="size-14" textClassName="text-xl" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-white group-hover:text-flag-yellow">{project.company.full_name}</span>
                {project.company.is_patriot && (
                  <span className="mt-1 flex">
                    <PatriotBadge />
                  </span>
                )}
                <span className="mt-1 block text-xs text-slate-500">Ver perfil da empresa →</span>
              </span>
            </Link>
          </Panel>
        </aside>
      </div>
    </div>
  );
}