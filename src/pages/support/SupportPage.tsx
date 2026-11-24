import { BadgeCheck, CalendarX2, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { CompanyCard } from "@/components/companies/CompanyCard";
import { DonationCard } from "@/components/support/DonationCard";
import { MembershipPanel } from "@/components/support/MembershipPanel";
import { PlanCard } from "@/components/support/PlanCard";
import { Badge } from "@/components/ui/Badge";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMyMembership, usePatriotCompanies, usePatriotDevs, usePlans } from "@/hooks/useMembership";
import { getErrorMessage } from "@/utils/errors";

const TABS: TabItem[] = [
  { id: "devs", label: "Devs" },
  { id: "empresas", label: "Empresas" },
];

function Supporters() {
  const [tab, setTab] = useState<"devs" | "empresas">("devs");
  const [page, setPage] = useState(1);
  const devs = usePatriotDevs(page);
  const companies = usePatriotCompanies(page);
  const query = tab === "devs" ? devs : companies;
  const data = query.data;

  return (
    <section className="mt-14">
      <SectionLabel tone="yellow">Apoiadores</SectionLabel>
      <h2 className="mt-3 text-2xl font-bold text-white">Quem já apoia a rede</h2>
      <div className="mt-5">
        <Tabs
          items={TABS}
          value={tab}
          onChange={(id) => {
            setTab(id as "devs" | "empresas");
            setPage(1);
          }}
        />
      </div>

      <div className="mt-6" aria-busy={query.isFetching}>
        {query.isPending && !query.isError && <Spinner />}
        {query.isError && <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Ainda não há apoiadores aqui">Seja o primeiro a apoiar.</EmptyState>}
        {tab === "devs" && devs.data && devs.data.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devs.data.items.map((dev) => (
              <Link
                key={dev.dev_id}
                to={`/devs/${dev.dev_id}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-flag-green/50"
              >
                <PatriotAvatar name={dev.full_name} url={dev.photo_url} patriot className="size-14" textClassName="text-xl" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white group-hover:text-flag-green">{dev.full_name}</p>
                  <p className="truncate text-sm text-slate-400">{dev.headline || "Dev"}</p>
                  {dev.accepts_patriot_discount && (
                    <div className="mt-1">
                      <Badge tone="yellow">Aceita desconto patriota</Badge>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        {tab === "empresas" && companies.data && companies.data.items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.data.items.map((company) => (
              <CompanyCard key={company.company_id} company={company} />
            ))}
          </div>
        )}
        {data && data.items.length > 0 && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      </div>
    </section>
  );
}

const BENEFITS = [
  { icon: BadgeCheck, title: "Selo de patriota", text: "Anel nas cores do Brasil ao redor da sua foto e etiqueta no perfil." },
  { icon: Users, title: "Lista de apoiadores", text: "Seu perfil aparece nesta página para toda a comunidade." },
  { icon: CalendarX2, title: "Sem fidelidade", text: "Cancele quando quiser. O selo vale até o fim do período pago." },
];

export default function SupportPage() {
  const { me } = useAuth();
  const plans = usePlans();
  const membership = useMyMembership();
  // O backend só aceita uma assinatura aberta por usuário; cancelada e já vencida volta 404 (null).
  const hasMembership = Boolean(membership.data);
  const open = membership.data && membership.data.status !== "cancelled";
  const previewName = me?.dev?.first_name ?? me?.company?.full_name ?? "Você";
  const previewUrl = me?.dev?.photo_url ?? me?.company?.photo_url ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6">
      <header className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <SectionLabel tone="yellow">Apoie</SectionLabel>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Ajude a manter a Brazilian Network</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Sua contribuição mantém a plataforma no ar e em evolução. Assine mensalmente e receba o selo de patriota, ou faça uma doação livre no valor que preferir.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 justify-self-center md:justify-self-end" aria-hidden>
          <PatriotAvatar name={previewName} url={previewUrl} patriot labeled className="size-36" textClassName="text-5xl" />
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Assim fica o seu perfil</span>
        </div>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-flag-green/10 text-flag-green">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-sm text-slate-400">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-label="Formas de apoiar">
        <SectionLabel tone="green">Como apoiar</SectionLabel>
        <h2 className="mt-3 text-2xl font-bold text-white">Escolha a melhor forma para você</h2>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            {hasMembership && <MembershipPanel membership={membership.data!} />}
            {plans.isPending && !plans.isError && <Spinner />}
            {plans.isError && <ErrorState message={getErrorMessage(plans.error)} onRetry={() => void plans.refetch()} />}
            {plans.data && plans.data.length === 0 && <EmptyState title="Nenhum plano disponível no momento">Volte em breve.</EmptyState>}
            {plans.data && plans.data.length > 0 && !open && (
              <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
                {plans.data.map((plan) => (
                  <PlanCard key={plan.plan_id} plan={plan} canSubscribe={!membership.isPending} />
                ))}
              </div>
            )}
          </div>
          <DonationCard />
        </div>
      </section>

      <Supporters />
    </div>
  );
}