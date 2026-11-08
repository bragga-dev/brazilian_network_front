import { Award, Briefcase, Cpu, ExternalLink, GraduationCap, MapPin, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { AddressesPanel } from "@/components/profile/AddressesPanel";
import { CompanyDataForm } from "@/components/profile/CompanyDataForm";
import { buildCompleteness, CompletenessCard } from "@/components/profile/CompletenessCard";
import { CoursesPanel } from "@/components/profile/CoursesPanel";
import { CurriculumCard } from "@/components/profile/CurriculumCard";
import { DevDataForm } from "@/components/profile/DevDataForm";
import { EducationPanel } from "@/components/profile/EducationPanel";
import { ExperiencePanel } from "@/components/profile/ExperiencePanel";
import { TechnologiesPanel } from "@/components/profile/TechnologiesPanel";
import { buttonClasses } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useIdentityMutation, useMyProfile } from "@/hooks/useProfile";
import { accountService } from "@/services/account.service";
import type { CompanyProfile } from "@/types/auth";
import { getErrorMessage } from "@/utils/errors";

function CompanyProfileView({ company, email }: { company: CompanyProfile; email: string }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") ?? "dados";
  const upload = useIdentityMutation(accountService.uploadCompanyPhoto);
  const remove = useIdentityMutation(async (_: void) => accountService.deleteCompanyPhoto());

  const completeness = buildCompleteness([
    { label: "Nome fantasia", done: Boolean(company.full_name) },
    { label: "Razão social e CNPJ", done: Boolean(company.legal_name && company.cnpj) },
    { label: "Sobre a empresa", done: company.bio.trim().length > 30 },
    { label: "WhatsApp de contato", done: Boolean(company.whatsapp) },
    { label: "Site ou redes sociais", done: Boolean(company.website || company.linkedin_url || company.github_url) },
  ]);

  const tabs: TabItem[] = [
    { id: "dados", label: "Dados", icon: User },
    { id: "enderecos", label: "Endereços", icon: MapPin },
  ];

  return (
    <>
      <Panel className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <PhotoUploader name={company.full_name ?? email} url={company.photo_url} rounded="2xl" onUpload={upload.mutateAsync} onRemove={() => remove.mutateAsync()} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{company.full_name ?? "Sua empresa"}</h1>
          <p className="mt-1 text-slate-400">{email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/empresas/${company.company_id}`} className={buttonClasses("secondary", "sm")}>
              <ExternalLink className="size-4" /> Ver perfil público
            </Link>
          </div>
        </div>
        <div className="w-full sm:w-56">
          <p className="text-xs text-slate-500">Perfil {completeness.percent}% completo</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-linear-to-r from-flag-green to-flag-yellow" style={{ width: `${completeness.percent}%` }} />
          </div>
        </div>
      </Panel>

      <div className="mt-6">
        <Tabs items={tabs} value={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} />
      </div>

      <div className="mt-6">
        {tab === "dados" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <CompanyDataForm company={company} />
            <div className="space-y-5 lg:self-start">
              <CompletenessCard completeness={completeness} />
            </div>
          </div>
        )}
        {tab === "enderecos" && <AddressesPanel owner="company" />}
      </div>
    </>
  );
}

function DevProfileView({ email }: { email: string }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") ?? "dados";
  const { data, isLoading, isError, error, refetch } = useMyProfile();
  const upload = useIdentityMutation(accountService.uploadDevPhoto);
  const remove = useIdentityMutation(async (_: void) => accountService.deleteDevPhoto());

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;

  const { dev, technologies, educations, experiences, courses } = data;
  const fullName = [dev.first_name, dev.last_name].filter(Boolean).join(" ") || email;

  const completeness = buildCompleteness([
    { label: "Título profissional", done: Boolean(dev.headline) },
    { label: "Sobre mim", done: dev.bio.trim().length > 30 },
    { label: "WhatsApp", done: Boolean(dev.whatsapp) },
    { label: "GitHub ou LinkedIn", done: Boolean(dev.github_url || dev.linkedin_url) },
    { label: "Currículo anexado", done: Boolean(dev.curriculum_url) },
    { label: "Tecnologias", done: technologies.length > 0 },
    { label: "Experiência profissional", done: experiences.length > 0 },
    { label: "Formação acadêmica", done: educations.length > 0 },
    { label: "Cursos complementares", done: courses.length > 0 },
  ]);

  const tabs: TabItem[] = [
    { id: "dados", label: "Dados", icon: User },
    { id: "enderecos", label: "Endereços", icon: MapPin },
    { id: "tecnologias", label: "Tecnologias", icon: Cpu, count: technologies.length },
    { id: "experiencia", label: "Experiência", icon: Briefcase, count: experiences.length },
    { id: "formacao", label: "Formação", icon: GraduationCap, count: educations.length },
    { id: "cursos", label: "Cursos", icon: Award, count: courses.length },
  ];

  return (
    <>
      <Panel className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <PhotoUploader name={fullName} url={dev.photo_url} onUpload={upload.mutateAsync} onRemove={() => remove.mutateAsync()} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{fullName}</h1>
          <p className="mt-1 text-slate-300">{dev.headline || "Adicione um título profissional"}</p>
          <p className="mt-1 text-sm text-slate-500">{email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/devs/${dev.dev_id}`} className={buttonClasses("secondary", "sm")}>
              <ExternalLink className="size-4" /> Ver perfil público
            </Link>
          </div>
        </div>
        <div className="w-full sm:w-56">
          <p className="text-xs text-slate-500">Perfil {completeness.percent}% completo</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-linear-to-r from-flag-green to-flag-yellow" style={{ width: `${completeness.percent}%` }} />
          </div>
        </div>
      </Panel>

      <div className="mt-6">
        <Tabs items={tabs} value={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} />
      </div>

      <div className="mt-6">
        {tab === "dados" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <DevDataForm dev={dev} />
            <div className="space-y-5 lg:self-start">
              <CompletenessCard completeness={completeness} />
              <CurriculumCard url={dev.curriculum_url} />
            </div>
          </div>
        )}
        {tab === "enderecos" && <AddressesPanel owner="dev" />}
        {tab === "tecnologias" && <TechnologiesPanel items={technologies} />}
        {tab === "experiencia" && <ExperiencePanel items={experiences} />}
        {tab === "formacao" && <EducationPanel items={educations} />}
        {tab === "cursos" && <CoursesPanel items={courses} />}
      </div>
    </>
  );
}

export default function MyProfilePage() {
  const { me } = useAuth();
  if (!me) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6">
      {me.company ? <CompanyProfileView company={me.company} email={me.user.email} /> : <DevProfileView email={me.user.email} />}
    </div>
  );
}