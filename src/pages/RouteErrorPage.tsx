import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Panel";

/** errorElement das rotas: captura erro de render/lazy sem derrubar o app inteiro. */
export default function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <SectionLabel tone="yellow">{notFound ? "Erro 404" : "Erro inesperado"}</SectionLabel>
      <h1 className="mt-4 text-4xl font-semibold text-white">{notFound ? "Página não encontrada" : "Algo deu errado"}</h1>
      <p className="mt-3 text-slate-400">Tente recarregar a página ou voltar ao início.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={() => window.location.reload()} className={buttonClasses("secondary")}>
          Recarregar
        </button>
        <Link to="/" className={buttonClasses("primary")}>
          Início →
        </Link>
      </div>
    </div>
  );
}
