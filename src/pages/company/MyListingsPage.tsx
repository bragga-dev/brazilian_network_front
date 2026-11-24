import { ListingsPanel } from "@/components/company/ListingsPanel";
import { SectionLabel } from "@/components/ui/Panel";

export default function MyListingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel tone="yellow">Empresa</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Minhas vagas e projetos</h1>
      <p className="mt-2 text-slate-400">Crie como rascunho, publique quando estiver pronto e acompanhe as candidaturas.</p>

      <div className="mt-8">
        <ListingsPanel />
      </div>
    </div>
  );
}