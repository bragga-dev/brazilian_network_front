import { Briefcase, Cpu, ExternalLink, Globe, MapPin } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useCompany } from "@/hooks/useCompanies";
import { cn } from "@/utils/cn";
import { getErrorMessage, getStatus } from "@/utils/errors";

function Stat({ icon, value, label, color }: { icon: ReactNode; value: string | number; label: string; color: string }) {
  return (
    <Panel className="flex items-center gap-4 px-5 py-4">
      <span className={cn("shrink-0", color)}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-2xl font-bold leading-none text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </div>
    </Panel>
  );
}

function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useCompany(companyId, page);

  // O backend não expõe "tecnologias da empresa": usamos as das vagas listadas.
  const technologies = useMemo(() => {
    const map = new Map<string, string>();
    for (const job of data?.jobs.items ?? []) for (const item of job.technologies) map.set(item.technology.technology_id, item.technology.name);
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [data]);

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    const notFound = getStatus(error) === 404;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={notFound ? "Empresa não encontrada." : getErrorMessage(error)} onRetry={notFound ? undefined : () => void refetch()} />
        <Link to="/empresas" className={buttonClasses("secondary", "md", "mt-6")}>
          ← Voltar para as empresas
        </Link>
      </div>
    );
  }

  const { company, jobs } = data;
  const location = [company.city, company.state].filter(Boolean).join(" - ");
  const links = [
    { href: company.website, label: "Site" },
    { href: company.linkedin_url, label: "LinkedIn" },
    { href: company.github_url, label: "GitHub" },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href));

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="hero-beams pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6">
          <Link to="/empresas" className="inline-flex rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-sm text-slate-300 backdrop-blur hover:text-white">
            ← Voltar para empresas
          </Link>
          <div className="mt-8 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
            <div className="shrink-0 rounded-2xl bg-linear-to-br from-flag-green via-flag-yellow to-flag-blue p-[3px]">
              <CompanyLogo name={company.full_name} url={company.photo_url} className="size-28 rounded-[calc(1rem-2px)] text-5xl md:size-36" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{company.full_name}</h1>
              {company.bio && <p className="mt-2 line-clamp-2 max-w-2xl text-lg text-slate-300">{company.bio}</p>}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400 md:justify-start">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-flag-green" /> {location}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
                    <Globe className="size-4 text-flag-blue" /> {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {jobs.total > 0 && <Badge tone="green">Contratando</Badge>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={<Briefcase className="size-9" strokeWidth={1.6} />} value={jobs.total} label="Vagas abertas" color="text-brand-purple" />
          <Stat icon={<Cpu className="size-9" strokeWidth={1.6} />} value={technologies.length} label="Tecnologias nas vagas" color="text-flag-green" />
          <Stat icon={<MapPin className="size-9" strokeWidth={1.6} />} value={location || "—"} label="Localização" color="text-flag-yellow" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card title="Sobre a empresa">
              {company.bio ? <p className="whitespace-pre-line text-slate-300">{company.bio}</p> : <p className="text-sm text-slate-500">Esta empresa ainda não escreveu uma apresentação.</p>}
            </Card>
            <Card title={`Vagas da empresa (${jobs.total})`}>
              {jobs.items.length === 0 ? (
                <EmptyState title="Nenhuma vaga aberta no momento" />
              ) : (
                <div className="grid gap-4">
                  {jobs.items.map((job) => (
                    <JobCard key={job.job_id} job={job} />
                  ))}
                </div>
              )}
              <Pagination page={jobs.page} pages={jobs.pages} onChange={setPage} />
            </Card>
          </div>

          <div className="space-y-5 lg:self-start">
            {technologies.length > 0 && (
              <Card title="Tecnologias">
                <div className="flex flex-wrap gap-2">
                  {technologies.map((name) => (
                    <Badge key={name} tone="blue">{name}</Badge>
                  ))}
                </div>
              </Card>
            )}
            {links.length > 0 && (
              <Card title="Links">
                <div className="flex flex-wrap gap-2">
                  {links.map((item) => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>
                      {item.label} <ExternalLink className="size-3.5" />
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}