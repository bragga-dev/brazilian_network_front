import { ArrowRight, Building2, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/Button";

/**
 * Arte opcional: coloque `public/hero.webp` (ou .png ajustando a URL) e ela aparece
 * à direita, por cima dos brilhos em CSS. Sem o arquivo, só os brilhos aparecem.
 */
const HERO_ART = "/hero.webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-beams pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-3/5 bg-cover bg-center opacity-90 [mask-image:linear-gradient(to_right,transparent,black_35%)] lg:block"
        style={{ backgroundImage: `url(${HERO_ART})` }}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-ink" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-slate-300 backdrop-blur">
          <span className="size-2 rounded-full bg-flag-green shadow-[0_0_8px_var(--color-flag-green)]" />
          Comunidade ativa • Conectando talentos e oportunidades
        </span>

        <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          O código que move o
          <span className="mt-1 block">
            <span className="text-gradient-flag text-6xl sm:text-7xl lg:text-8xl">Brasil</span>
            <span className="caret ml-2 inline-block h-12 w-0.5 translate-y-1 bg-white sm:h-16 lg:h-20" aria-hidden />
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-slate-300">
          Vagas, empresas e devs em uma rede completa para quem constrói o futuro da tecnologia no Brasil.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/vagas" className={buttonClasses("primary", "md", "px-7 py-3.5")}>
            <Search className="size-5" /> Buscar Vagas <ArrowRight className="size-4" />
          </Link>
          <Link to="/empresas" className={buttonClasses("secondary", "md", "px-7 py-3.5")}>
            <Building2 className="size-5" /> Explorar Empresas
          </Link>
        </div>
      </div>
    </section>
  );
}