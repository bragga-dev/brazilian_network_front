import { Briefcase, Building2, ChevronDown, FolderKanban, House, LogIn, LogOut, Menu, Settings, UserPlus, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import type { Me } from "@/types/auth";
import { cn } from "@/utils/cn";

import { Logo } from "./Logo";

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Início", icon: House, end: true },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/empresas", label: "Empresas", icon: Building2 },
];

function displayName(me: Me): string {
  return me.dev?.first_name || me.company?.full_name || me.user.email;
}

function Avatar({ me }: { me: Me }) {
  const url = me.dev?.photo_url ?? me.company?.photo_url;
  if (url) return <img src={url} alt="" className="size-10 rounded-full border border-white/15 object-cover" />;
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-flag-green to-flag-blue font-bold text-black">
      {displayName(me).charAt(0).toUpperCase()}
    </span>
  );
}

function UserMenu({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition hover:bg-white/5"
      >
        <Avatar me={me} />
        <ChevronDown className={cn("size-4 text-slate-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl">
          <div className="border-b border-white/10 px-3 py-2">
            <p className="truncate text-sm font-medium text-white">{displayName(me)}</p>
            <p className="truncate text-xs text-slate-500">{me.user.email}</p>
          </div>
          <Link
            to="/conta"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <Settings className="size-4" /> Minha conta
          </Link>
          <button
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { status, me, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-2 px-4 py-6 text-sm font-medium transition-colors",
                  isActive ? "text-flag-green" : "text-slate-300 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-[18px]" />
                  {label}
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-flag-green shadow-[0_0_10px_var(--color-flag-green)]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" && <span className="h-10 w-48" aria-hidden />}
          {status === "anonymous" && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/cadastro" className={buttonClasses("purple", "sm")}>
                <UserPlus className="size-4" /> Cadastrar
              </Link>
              <Link to="/entrar" className={buttonClasses("secondary", "sm")}>
                <LogIn className="size-4" /> Login
              </Link>
            </div>
          )}
          {status === "authenticated" && me && <UserMenu me={me} onLogout={() => void logout()} />}

          <button
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-ink px-4 py-3 lg:hidden" aria-label="Principal (mobile)">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium", isActive ? "bg-white/5 text-flag-green" : "text-slate-300")
              }
            >
              <Icon className="size-5" /> {label}
            </NavLink>
          ))}
          {status === "anonymous" && (
            <div className="mt-3 flex gap-2 sm:hidden">
              <Link to="/cadastro" className={buttonClasses("purple", "sm", "flex-1")}>
                Cadastrar
              </Link>
              <Link to="/entrar" className={buttonClasses("secondary", "sm", "flex-1")}>
                Login
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}