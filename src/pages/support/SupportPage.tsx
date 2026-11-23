import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { CompanyCard } from "@/components/companies/CompanyCard";
import { MembershipPanel } from "@/components/support/MembershipPanel";
import { PlanCard } from "@/components/support/PlanCard";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { SectionLabel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
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
                {dev.photo_url ? (
                  <img src={dev.photo_url} alt="" loading="lazy" className="size-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-flag-green to-flag-blue font-bold text-black">
                    {dev.full_name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white group-hover:text-flag-green">{dev.full_name}</p>
                  <p className="truncate text-sm text-slate-400">{dev.headline || "Dev"}</p>
                  {dev.accepts_patriot_discount && (
                    <div className="mt-1">
                      <Badge tone="yellow" icon={<ShieldCheck className="size-3" />}>
                        Desconto a patriotas
                      </Badge>
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

export default function SupportPage() {
  const plans = usePlans();
  const membership = useMyMembership();
  // O backend só aceita uma assinatura aberta por usuário; cancelada e já vencida volta 404 (null).
  const hasMembership = Boolean(membership.data);
  const open = membership.data && membership.data.status !== "cancelled";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel tone="yellow">Apoie</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Ajude a manter a Brazilian Network</h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Apoiadores recebem o selo de patriota no perfil e aparecem nesta página. O selo é concedido quando o pagamento da assinatura mensal é confirmado.
      </p>

      {hasMembership && (
        <div className="mt-8">
          <MembershipPanel membership={membership.data!} />
        </div>
      )}

      <div className="mt-8">
        {plans.isPending && !plans.isError && <Spinner />}
        {plans.isError && <ErrorState message={getErrorMessage(plans.error)} onRetry={() => void plans.refetch()} />}
        {plans.data && plans.data.length === 0 && <EmptyState title="Nenhum plano disponível no momento">Volte em breve.</EmptyState>}
        {plans.data && plans.data.length > 0 && !open && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.data.map((plan) => (
              <PlanCard key={plan.plan_id} plan={plan} canSubscribe={!membership.isPending} />
            ))}
          </div>
        )}
      </div>

      <Supporters />
    </div>
  );
}