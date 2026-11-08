import { Award, Briefcase, Cpu, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { CourseCard, EducationCard, ExperienceCard } from "@/components/profile/ProfileItems";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, Spinner } from "@/components/ui/States";
import { PROFICIENCY_RANK } from "@/constants/profileOptions";
import { usePublicProfile } from "@/hooks/useProfile";
import type { DevTechnology } from "@/types/profile";
import { cn } from "@/utils/cn";
import { getErrorMessage, getStatus } from "@/utils/errors";

function Stat({ icon, value, label, color }: { icon: ReactNode; value: number; label: string; color: string }) {
  return (
    <Panel className="flex items-center gap-4 px-5 py-4">
      <span className={cn("shrink-0", color)}>{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none text-white">{value}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </div>
    </Panel>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <Panel className={cn("p-5 sm:p-6", className)}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

function SkillBar({ item }: { item: DevTechnology }) {
  const rank = PROFICIENCY_RANK[item.proficiency];
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-white">{item.technology.name}</span>
        <span className="text-xs text-slate-500">
          {item.years_experience > 0 ? `${item.years_experience} ${item.years_experience === 1 ? "ano" : "anos"}` : "< 1 ano"}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className={cn("h-1.5 flex-1 rounded-full", step <= rank ? "bg-flag-green" : "bg-white/10")} />
          ))}
        </div>
        <span className="text-xs text-slate-400">{item.proficiency_label}</span>
      </div>
    </li>
  );
}

export default function DevProfilePage() {
  const { devId } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicProfile(devId);

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    const notFound = getStatus(error) === 404 || getStatus(error) === 422;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={notFound ? "Perfil não encontrado." : getErrorMessage(error)} onRetry={notFound ? undefined : () => void refetch()} />
        <Link to="/" className={buttonClasses("secondary", "md", "mt-6")}>
          ← Voltar para o início
        </Link>
      </div>
    );
  }

  const { dev, technologies, educations, experiences, courses } = data;
  const links = [
    { href: dev.github_url, label: "GitHub" },
    { href: dev.linkedin_url, label: "LinkedIn" },
    { href: dev.site_url, label: "Site" },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href));
  const topTechs = technologies.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="hero-beams pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6 md:flex-row md:items-center md:gap-8 md:py-14 md:text-left">
          <div className="size-32 shrink-0 rounded-full bg-linear-to-br from-flag-green via-flag-yellow to-flag-blue p-[3px] md:size-40">
            <div className="size-full overflow-hidden rounded-full bg-ink">
              {dev.photo_url ? <img src={dev.photo_url} alt={`Foto de ${dev.full_name}`} className="size-full object-cover" /> : <CompanyLogo name={dev.full_name} className="size-full rounded-full text-5xl" />}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{dev.full_name}</h1>
              {dev.is_patriot && (
                <Badge tone="yellow">
                  <ShieldCheck className="mr-1 size-3" /> Patriota
                </Badge>
              )}
            </div>
            {dev.headline && <p className="mt-2 text-lg text-slate-300">{dev.headline}</p>}
            {dev.username && <p className="mt-1 text-sm text-slate-500">@{dev.username}</p>}
            {topTechs.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {topTechs.map((item) => (
                  <Badge key={item.dev_technology_id} tone="blue">{item.technology.name}</Badge>
                ))}
                {technologies.length > topTechs.length && <Badge>+{technologies.length - topTechs.length}</Badge>}
              </div>
            )}
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {links.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>
                    {item.label} <ExternalLink className="size-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Cpu className="size-9" strokeWidth={1.6} />} value={technologies.length} label="Tecnologias" color="text-flag-green" />
          <Stat icon={<Briefcase className="size-9" strokeWidth={1.6} />} value={experiences.length} label="Experiências" color="text-brand-purple" />
          <Stat icon={<GraduationCap className="size-9" strokeWidth={1.6} />} value={educations.length} label="Formações" color="text-flag-blue" />
          <Stat icon={<Award className="size-9" strokeWidth={1.6} />} value={courses.length} label="Cursos" color="text-flag-yellow" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <Section title="Sobre mim">
              {dev.bio ? <p className="whitespace-pre-line text-slate-300">{dev.bio}</p> : <p className="text-sm text-slate-500">Este dev ainda não escreveu uma apresentação.</p>}
              {dev.accepts_patriot_discount && <p className="mt-3 text-sm text-flag-yellow">Aceita desconto patriota.</p>}
            </Section>
            {experiences.length > 0 && (
              <Section title="Experiência profissional">
                <div className="space-y-3">
                  {experiences.map((item) => (
                    <ExperienceCard key={item.experience_id} item={item} />
                  ))}
                </div>
              </Section>
            )}
            {educations.length > 0 && (
              <Section title="Formação acadêmica">
                <div className="space-y-3">
                  {educations.map((item) => (
                    <EducationCard key={item.education_id} item={item} />
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-5 lg:self-start">
            {technologies.length > 0 && (
              <Section title="Habilidades">
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {technologies.map((item) => (
                    <SkillBar key={item.dev_technology_id} item={item} />
                  ))}
                </ul>
              </Section>
            )}
            {courses.length > 0 && (
              <Section title="Cursos complementares">
                <div className="space-y-3">
                  {courses.map((item) => (
                    <CourseCard key={item.course_id} item={item} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}