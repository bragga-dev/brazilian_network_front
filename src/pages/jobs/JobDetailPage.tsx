import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { buttonClasses } from "@/components/ui/Button";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useJob } from "@/hooks/useJobs";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { formatDate, formatLocation, formatRelative, formatSalary } from "@/utils/format";

function TextBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <section className="mt-8">
      <SectionLabel tone="muted">{title}</SectionLabel>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300">{text}</p>
    </section>
  );
}

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { data: job, isLoading, isError, error, refetch } = useJob(jobId);

  if (isLoading) return <Spinner />;
  if (isError || !job) {
    const notFound = getStatus(error) === 404;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          message={notFound ? "Esta vaga não existe mais ou foi encerrada." : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => void refetch()}
        />
        <Link to="/vagas" className={buttonClasses("secondary", "md", "mt-6")}>
          ← Voltar para as vagas
        </Link>
      </div>
    );
  }

  const required = job.technologies.filter((t) => t.is_required);
  const optional = job.technologies.filter((t) => !t.is_required);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6">
      <Link to="/vagas" className="text-sm text-slate-400 hover:text-white">
        ← Vagas
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">{job.contract_type_label}</Badge>
            <Badge tone="purple">{job.work_model_label}</Badge>
            <Badge>{job.experience_level_label}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-slate-400">
            {formatLocation(job)} · publicada {formatRelative(job.published_at)}
          </p>

          <TextBlock title="Sobre a vaga" text={job.description} />
          <TextBlock title="Requisitos" text={job.requirements} />
          <TextBlock title="Benefícios" text={job.benefits} />

          {job.technologies.length > 0 && (
            <section className="mt-8">
              <SectionLabel tone="muted">Stack</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {required.map((t) => (
                  <Badge key={t.technology.technology_id} tone="blue">
                    {t.technology.name}
                  </Badge>
                ))}
                {optional.map((t) => (
                  <Badge key={t.technology.technology_id}>{t.technology.name} · desejável</Badge>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Panel className="p-5">
            <SectionLabel tone="yellow">Remuneração</SectionLabel>
            <p className="mt-3 text-2xl font-semibold text-white">{formatSalary(job)}</p>
            {job.contract_type === "freelance" && (
              <ul className="mt-3 space-y-1 text-sm text-slate-400">
                {job.deadline && <li>Prazo: {formatDate(job.deadline)}</li>}
                {job.estimated_duration_days && <li>Duração estimada: {job.estimated_duration_days} dias</li>}
              </ul>
            )}
            <button disabled className={buttonClasses("primary", "md", "mt-5 w-full")} title="Em breve">
              Candidatar-se (em breve)
            </button>
          </Panel>

          <Panel className="p-5">
            <SectionLabel tone="blue">Empresa</SectionLabel>
            <Link to={`/empresas/${job.company.company_id}`} className="mt-4 flex items-center gap-3 hover:text-flag-yellow">
              <CompanyLogo name={job.company.full_name} url={job.company.photo_url} className="size-12 text-lg" />
              <span className="font-medium text-white">{job.company.full_name}</span>
            </Link>
          </Panel>
        </aside>
      </div>
    </div>
  );
}