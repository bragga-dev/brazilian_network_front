import { NavLink, Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

import { Logo } from "./Logo";

const NAV = [
  { to: "/vagas", label: "Vagas" },
  { to: "/empresas", label: "Empresas" },
];

export function Header() {
  const { status, me, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 border border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("text-sm transition-colors hover:text-white", isActive ? "text-white" : "text-slate-400")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" && <span className="h-8 w-24" aria-hidden />}
          {status === "anonymous" && (
            <>
              <Link to="/entrar" className={buttonClasses("ghost", "sm")}>
                Entrar
              </Link>
              <Link to="/cadastro" className={buttonClasses("primary", "sm")}>
                Criar conta →
              </Link>
            </>
          )}
          {status === "authenticated" && me && (
            <>
              <span className="hidden max-w-40 truncate font-mono text-[11px] text-slate-400 md:block">{me.user.email}</span>
              <button onClick={() => void logout()} className={buttonClasses("secondary", "sm")}>
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
