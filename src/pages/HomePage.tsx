import { Link } from "react-router-dom";

import { JobCard } from "@/components/jobs/JobCard";
import { buttonClasses } from "@/components/ui/Button";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";

const CAPABILITIES = [
  { to: "/vagas", label: "Vagas para devs" },
  { to: "/empresas", label: "Empresas que contratam" },
  { to: "/cadastro", label: "Criar perfil de dev" },
  { to: "/cadastro?tipo=company", label: "Publicar vagas" },
];

export default function HomePage() {
  const jobs = useJobs({ page_size: 3 });
  const companies = useCompanies({ page_size: 1 });
  const latest = jobs.data?.items ?? [];

  return (
    <>
      <section className="relative -mt-20 overflow-hidden pb-24 pt-44">
        <div className="hero-beams pointer-events-none absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-ink" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-slate-300">
            <span className="size-1.5 rounded-full bg-flag-green shadow-[0_0_8px_var(--color-flag-green)]" />
            Vagas abertas agora
          </span>
          <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl">
            O código que move o <span className="text-gradient-flag">Brasil</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
            Vagas, empresas e devs em uma rede feita para quem constrói software no país.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/vagas" className={buttonClasses("primary")}>
              Ver vagas →
            </Link>
            <Link to="/cadastro?tipo=company" className={buttonClasses("secondary")}>
              Sou empresa →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 lg:grid-cols-[1fr_1.4fr_1fr]">
        <Panel className="p-6">
          <SectionLabel>Status da rede</SectionLabel>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Vagas abertas</dt>
              <dd className="mt-1 text-5xl font-semibold text-white">{jobs.data?.total ?? "—"}</dd>
            </div>
            <div className="border-t border-white/10 pt-6">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Empresas</dt>
              <dd className="mt-1 text-5xl font-semibold text-white">{companies.data?.total ?? "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-6">
          <SectionLabel tone="yellow">Vaga em destaque</SectionLabel>
          {latest[0] ? (
            <div className="mt-5">
              <JobCard job={latest[0]} />
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">{jobs.isLoading ? "Carregando..." : "Nenhuma vaga publicada ainda."}</p>
          )}
        </Panel>

        <Panel className="p-6">
          <SectionLabel tone="blue">Índice</SectionLabel>
          <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {CAPABILITIES.map((item, index) => (
              <li key={item.to}>
                <Link to={item.to} className="group flex items-center justify-between py-4 text-sm text-slate-200 hover:text-white">
                  <span>
                    <span className="mr-3 font-mono text-[10px] text-slate-600">0{index + 1}</span>
                    {item.label}
                  </span>
                  <span className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-flag-yellow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      {latest.length > 1 && (
        <section className="mx-auto mt-16 max-w-6xl px-4">
          <div className="mb-5 flex items-end justify-between">
            <SectionLabel>Últimas vagas</SectionLabel>
            <Link to="/vagas" className="font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-flag-yellow">
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {latest.slice(1).map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
