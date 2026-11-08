import { Link } from "react-router-dom";

import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Logo />
          <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
          <p className="text-sm text-slate-400">Conectando o Brasil através da tecnologia.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400" aria-label="Rodapé">
          <Link to="/vagas" className="hover:text-white">
            Vagas
          </Link>
          <Link to="/projetos" className="hover:text-white">
            Projetos
          </Link>
          <Link to="/empresas" className="hover:text-white">
            Empresas
          </Link>
          <Link to="/cadastro" className="hover:text-white">
            Criar conta
          </Link>
        </nav>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Brazilian Network</p>
      </div>
      <div className="h-px bg-linear-to-r from-flag-green via-flag-yellow to-flag-blue opacity-60" />
    </footer>
  );
}