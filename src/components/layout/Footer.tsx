import { ArrowUp, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

import { Logo } from "./Logo";

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Plataforma",
    links: [
      { to: "/vagas", label: "Vagas" },
      { to: "/projetos", label: "Projetos freelancer" },
      { to: "/devs", label: "Devs" },
      { to: "/empresas", label: "Empresas" },
    ],
  },
  {
    title: "Para devs",
    links: [
      { to: "/cadastro", label: "Criar perfil" },
      { to: "/perfil", label: "Meu perfil" },
      { to: "/candidaturas", label: "Minhas candidaturas" },
    ],
  },
  {
    title: "Para empresas",
    links: [
      { to: "/cadastro", label: "Cadastrar empresa" },
      { to: "/empresa/oportunidades", label: "Publicar vagas e projetos" },
      { to: "/empresa/candidaturas", label: "Candidaturas recebidas" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { to: "/apoie", label: "Apoie a rede" },
      { to: "/contato", label: "Fale conosco" },
      { to: "/entrar", label: "Entrar" },
    ],
  },
];

export function Footer() {
  const { status } = useAuth();

  return (
    <footer className="mt-20 border-t border-white/10 bg-ink">
      {status === "anonymous" && (
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-linear-to-r from-flag-green/10 via-flag-blue/10 to-brand-purple/10 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Faça parte da rede</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-300">Crie seu perfil para se candidatar a vagas e projetos, ou cadastre sua empresa e encontre profissionais de todo o Brasil.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/cadastro" className={buttonClasses("primary", "md")}>
                <UserPlus className="size-4" aria-hidden /> Criar conta grátis
              </Link>
              <Link to="/entrar" className={buttonClasses("secondary", "md")}>
                <LogIn className="size-4" aria-hidden /> Entrar
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="md:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">Vagas, projetos, empresas e devs em uma rede completa para quem constrói o futuro da tecnologia no Brasil.</p>
          <div className="mt-5 flex items-center gap-2" aria-hidden>
            <span className="size-2.5 rounded-full bg-flag-green" />
            <span className="size-2.5 rounded-full bg-flag-yellow" />
            <span className="size-2.5 rounded-full bg-flag-blue" />
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{column.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link to={link.to} className="transition hover:text-flag-green">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
          <p>© {new Date().getFullYear()} Brazilian Network. Todos os direitos reservados.</p>
          <p>Feito no Brasil com 💚💛💙</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-1.5 text-slate-400 transition hover:text-white">
            Voltar ao topo <ArrowUp className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
      <div className="h-px bg-linear-to-r from-flag-green via-flag-yellow to-flag-blue opacity-60" />
    </footer>
  );
}