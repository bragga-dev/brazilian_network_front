import { ReceivedApplicationsPanel } from "@/components/company/ReceivedApplicationsPanel";
import { SectionLabel } from "@/components/ui/Panel";

export default function ReceivedApplicationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel tone="yellow">Empresa</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Candidaturas recebidas</h1>
      <p className="mt-2 text-slate-400">Avalie quem se candidatou às suas vagas e enviou propostas aos seus projetos.</p>

      <div className="mt-8">
        <ReceivedApplicationsPanel />
      </div>
    </div>
  );
}