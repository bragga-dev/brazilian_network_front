import { Building2, ChevronRight, Code2, Flag, Mail, Megaphone, Users, type LucideIcon } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { useAdminCampaigns, useAdminContacts, useAdminUsers, useReportedReviews } from "@/hooks/useAdmin";
import { usePublicMetrics } from "@/hooks/useMetrics";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

const fmt = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value));

function Kpi({ icon: Glyph, label, value, onClick }: { icon: LucideIcon; label: string; value: number | undefined; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-flag-green/40 hover:bg-white/[0.06]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-flag-green">
        <Glyph className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-3xl font-bold leading-none text-white">{fmt(value)}</span>
        <span className="mt-1.5 block text-sm text-slate-400">{label}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-slate-600 transition group-hover:text-flag-green" aria-hidden />
    </button>
  );
}

function TaskRow({ icon: Glyph, label, hint, value, onClick }: { icon: LucideIcon; label: string; hint: string; value: number | undefined; onClick: () => void }) {
  const open = (value ?? 0) > 0;
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-4 border-b border-white/10 px-5 py-4 text-left last:border-b-0 hover:bg-white/[0.04]">
      <Glyph className={cn("size-5 shrink-0", open ? "text-flag-yellow" : "text-slate-500")} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
      <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", open ? "bg-flag-yellow/15 text-flag-yellow" : "bg-white/5 text-slate-400")}>{fmt(value)}</span>
      <ChevronRight className="size-4 shrink-0 text-slate-600 transition group-hover:text-white" aria-hidden />
    </button>
  );
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-2xl font-bold text-white">{fmt(value)}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

export function AdminOverviewPanel({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const metrics = usePublicMetrics();
  const users = useAdminUsers({ page_size: 1 });
  const devs = useAdminUsers({ role: "dev", page_size: 1 });
  const companies = useAdminUsers({ role: "company", page_size: 1 });
  const campaigns = useAdminCampaigns(1);
  const pendingContacts = useAdminContacts({ status: "pending", page_size: 1 });
  const reported = useReportedReviews(1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Usuários" value={users.data?.total} onClick={() => onNavigate("usuarios")} />
        <Kpi icon={Code2} label="Devs" value={devs.data?.total} onClick={() => onNavigate("devs")} />
        <Kpi icon={Building2} label="Empresas" value={companies.data?.total} onClick={() => onNavigate("empresas")} />
        <Kpi icon={Megaphone} label="Campanhas" value={campaigns.data?.total} onClick={() => onNavigate("campanhas")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">Pendências</h2>
            <p className="text-xs text-slate-500">O que está esperando uma ação sua.</p>
          </div>
          <TaskRow icon={Mail} label="Mensagens de contato" hint="Aguardando resposta" value={pendingContacts.data?.total} onClick={() => onNavigate("contatos")} />
          <TaskRow icon={Flag} label="Avaliações denunciadas" hint="Aguardando moderação" value={reported.data?.total} onClick={() => onNavigate("avaliacoes")} />
        </Panel>

        <Panel className="p-5">
          <h2 className="font-semibold text-white">Audiência</h2>
          <p className="text-xs text-slate-500">Visitantes únicos por navegador; nenhum IP é guardado.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Online agora (logados)" value={metrics.data?.online_now} />
            <Metric label="Visitantes hoje" value={metrics.data?.visitors_today} />
            <Metric label="Últimos 7 dias" value={metrics.data?.visitors_last_7_days} />
            <Metric label="Últimos 30 dias" value={metrics.data?.visitors_last_30_days} />
          </div>
        </Panel>
      </div>
    </div>
  );
}