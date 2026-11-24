import { useId } from "react";

import { cn } from "@/utils/cn";

import { BrazilFlag } from "./BrazilFlag";
import { CompanyLogo } from "./CompanyLogo";

interface Props {
  name: string;
  url?: string | null;
  patriot?: boolean;
  /** `circle` = foto de pessoa; `square` = logo de empresa. */
  shape?: "circle" | "square";
  /** Tamanho do container, ex.: "size-14". */
  className?: string;
  /** Tamanho da inicial quando não há foto, ex.: "text-xl". */
  textClassName?: string;
  /** Só no círculo: faixa curva "PATRIOTA" em volta da foto (estilo #OpenToWork). Use em tamanhos grandes (≥ 96px). */
  labeled?: boolean;
  alt?: string;
}

const RING_STOPS = (
  <>
    <stop offset="0" stopColor="#2be05f" />
    <stop offset="0.5" stopColor="#ffe600" />
    <stop offset="1" stopColor="#3b82f6" />
  </>
);

// Arco inferior (de 145° a 35°, sentido anti-horário) para a faixa e o texto.
const arc = (r: number) => `M ${50 - 0.819 * r} ${50 + 0.574 * r} A ${r} ${r} 0 0 0 ${50 + 0.819 * r} ${50 + 0.574 * r}`;

/** Foto/logo com o selo de patriota: anel nas cores do Brasil ao redor (+ faixa "PATRIOTA" nos tamanhos grandes) e mini bandeira. */
export function PatriotAvatar({ name, url, patriot = false, shape = "circle", className, textClassName, labeled = false, alt = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (shape === "square") {
    if (!patriot) return <CompanyLogo name={name} url={url} className={cn(className, textClassName)} />;
    return (
      <span className={cn("relative inline-block shrink-0 rounded-2xl bg-linear-to-br from-flag-green via-flag-yellow to-flag-blue p-[2.5px] shadow-[0_0_22px_-6px_var(--color-flag-yellow)]", className)}>
        <CompanyLogo name={name} url={url} className={cn("size-full rounded-[calc(1rem-2.5px)] border-0", textClassName)} />
        <BrazilFlag className="absolute -bottom-1.5 -right-1.5 w-[34%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
      </span>
    );
  }

  const photo = url ? (
    <img src={url} alt={alt} loading="lazy" className="size-full rounded-full object-cover" />
  ) : (
    <span aria-hidden className={cn("flex size-full items-center justify-center rounded-full bg-linear-to-br from-flag-green to-flag-blue font-bold text-black", textClassName)}>
      {initial}
    </span>
  );

  if (!patriot) {
    return <span className={cn("inline-block shrink-0 overflow-hidden rounded-full border border-white/15", className)}>{photo}</span>;
  }

  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <span className="absolute inset-[6%] overflow-hidden rounded-full bg-ink">{photo}</span>
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            {RING_STOPS}
          </linearGradient>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0a7a33" />
            <stop offset="0.5" stopColor="#0b3d9e" />
            <stop offset="1" stopColor="#0a7a33" />
          </linearGradient>
          <path id={`${uid}-text`} d={arc(46.5)} />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="6" />
        {labeled && (
          <>
            <path d={arc(43)} fill="none" stroke="#04070b" strokeWidth="15.5" strokeLinecap="round" />
            <path d={arc(43)} fill="none" stroke={`url(#${uid}-band)`} strokeWidth="13" strokeLinecap="round" />
            <text fontSize="8.6" fontWeight="800" letterSpacing="1.6" fill="#ffe600" textAnchor="middle">
              <textPath href={`#${uid}-text`} startOffset="50%">
                PATRIOTA
              </textPath>
            </text>
          </>
        )}
      </svg>
      {!labeled && <BrazilFlag className="absolute -bottom-0.5 -right-1 w-[40%] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" />}
    </span>
  );
}