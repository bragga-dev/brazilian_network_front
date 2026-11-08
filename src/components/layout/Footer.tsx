import { Link } from "react-router-dom";

import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center">
        <Logo />
        <nav className="flex gap-6 text-sm text-slate-400">
          <Link to="/vagas" className="hover:text-white">
            Vagas
          </Link>
          <Link to="/empresas" className="hover:text-white">
            Empresas
          </Link>
          <Link to="/cadastro" className="hover:text-white">
            Criar conta
          </Link>
        </nav>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
          © {new Date().getFullYear()} Brazilian Network
        </p>
      </div>
      <div className="h-px bg-linear-to-r from-flag-green via-flag-yellow to-flag-blue opacity-60" />
    </footer>
  );
}
