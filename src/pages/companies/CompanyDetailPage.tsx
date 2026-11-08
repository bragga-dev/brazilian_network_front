import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { JobCard } from "@/components/jobs/JobCard";
import { buttonClasses } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useCompany } from "@/hooks/useCompanies";
import { getErrorMessage, getStatus } from "@/utils/errors";

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useCompany(companyId, page);

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
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-12">
      <Link to="/empresas" className="font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-flag-yellow">
        ← Empresas
      </Link>

      <Panel className="mt-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <img src={company.photo_url ?? "/logo.png"} alt="" className="size-24 border border-white/10 bg-black object-cover" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-white">{company.full_name}</h1>
          {location && <p className="mt-1 text-slate-400">{location}</p>}
          {company.bio && <p className="mt-3 max-w-2xl whitespace-pre-line text-slate-300">{company.bio}</p>}
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>
                  {item.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <div className="mt-10">
        <SectionLabel>{`Vagas abertas (${jobs.total})`}</SectionLabel>
        <div className="mt-5 space-y-4">
          {jobs.items.length === 0 && <EmptyState title="Nenhuma vaga aberta no momento" />}
          {jobs.items.map((job) => (
            <JobCard key={job.job_id} job={job} />
          ))}
        </div>
        <Pagination page={jobs.page} pages={jobs.pages} onChange={setPage} />
      </div>
    </div>
  );
}
