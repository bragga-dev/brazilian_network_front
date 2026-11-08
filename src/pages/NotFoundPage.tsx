import { Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Panel";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <SectionLabel tone="yellow">Erro 404</SectionLabel>
      <h1 className="mt-4 text-5xl font-semibold text-white">Página não encontrada</h1>
      <p className="mt-3 text-slate-400">O endereço não existe ou foi movido.</p>
      <Link to="/" className={buttonClasses("primary", "md", "mt-8")}>
        Voltar ao início →
      </Link>
    </div>
  );
}
