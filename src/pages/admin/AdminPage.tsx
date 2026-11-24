import { Building2, Code2, Flag, LayoutDashboard, Mail, Megaphone, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { AdminCampaignsPanel } from "@/components/admin/AdminCampaignsPanel";
import { AdminContactsPanel } from "@/components/admin/AdminContactsPanel";
import { AdminOverviewPanel } from "@/components/admin/AdminOverviewPanel";
import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { SectionLabel } from "@/components/ui/Panel";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useAdminContacts, useReportedReviews } from "@/hooks/useAdmin";

const TAB_IDS = ["visao-geral", "usuarios", "empresas", "devs", "contatos", "avaliacoes", "campanhas"] as const;
type TabId = (typeof TAB_IDS)[number];

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("aba");
  const tab: TabId = TAB_IDS.find((id) => id === requested) ?? "visao-geral";

  // Mesmas chaves de cache da visão geral: não geram requisições extras.
  const pendingContacts = useAdminContacts({ status: "pending", page_size: 1 });
  const reported = useReportedReviews(1);

  const go = (id: string) => setParams(id === "visao-geral" ? {} : { aba: id }, { replace: true });

  const tabs: TabItem[] = [
    { id: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "empresas", label: "Empresas", icon: Building2 },
    { id: "devs", label: "Devs", icon: Code2 },
    { id: "contatos", label: "Contatos", icon: Mail, count: pendingContacts.data?.total || undefined },
    { id: "avaliacoes", label: "Avaliações denunciadas", icon: Flag, count: reported.data?.total || undefined },
    { id: "campanhas", label: "Campanhas", icon: Megaphone },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6">
      <SectionLabel tone="yellow">Administração</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Painel admin</h1>
      <p className="mt-2 text-slate-400">Moderação, usuários, mensagens de contato e campanhas da plataforma.</p>

      <div className="mt-8">
        <Tabs items={tabs} value={tab} onChange={go} />
      </div>

      <div className="mt-8">
        {tab === "visao-geral" && <AdminOverviewPanel onNavigate={go} />}
        {tab === "usuarios" && <AdminUsersPanel key="usuarios" />}
        {tab === "empresas" && <AdminUsersPanel key="empresas" role="company" />}
        {tab === "devs" && <AdminUsersPanel key="devs" role="dev" />}
        {tab === "contatos" && <AdminContactsPanel />}
        {tab === "avaliacoes" && <AdminReviewsPanel />}
        {tab === "campanhas" && <AdminCampaignsPanel />}
      </div>
    </div>
  );
}