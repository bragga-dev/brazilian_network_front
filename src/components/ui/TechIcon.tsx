import { Braces, Brain, Bug, Cloud, Database, Monitor, Palette, Server, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/utils/cn";

/**
 * Os logos de marca (~200 kB) ficam num chunk separado, carregado depois da primeira renderização.
 * Até lá (ou se falhar) o ícone genérico da categoria ocupa o mesmo espaço, sem pulo de layout.
 */
type TechIconsModule = typeof import("@/constants/techIcons");
let loaded: TechIconsModule | null = null;
let loading = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded && !loading) {
    loading = true;
    void import("@/constants/techIcons")
      .then((module) => {
        loaded = module;
        listeners.forEach((notify) => notify());
      })
      .catch(() => {
        loading = false;
      });
  }
  return () => listeners.delete(listener);
}

const useTechIcons = () => useSyncExternalStore(subscribe, () => loaded);

/** Sem logo da marca, o ícone sai da categoria da tecnologia (ordem importa: primeiro match vence). */
const CATEGORY_FALLBACKS: [RegExp, LucideIcon][] = [
  [/banco|database|\bsql\b|dados/, Database],
  [/mobile|android|ios/, Smartphone],
  [/cloud|devops|infra|nuvem/, Cloud],
  [/front/, Monitor],
  [/back|api|servidor/, Server],
  [/design|\bux\b|\bui\b/, Palette],
  [/seguranca|security/, ShieldCheck],
  [/\bia\b|\bai\b|machine|inteligencia/, Brain],
  [/teste|test|qualidade|\bqa\b/, Bug],
];

function fallbackFor(categories: string[] = []): LucideIcon {
  const text = categories
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_FALLBACKS.find(([pattern]) => pattern.test(text))?.[1] ?? Braces;
}

/** Cores de marca muito escuras (GitHub, Next.js, Express...) somem no fundo preto: usa o cinza claro do tema. */
function readableColor(hex: string): string {
  const value = parseInt(hex, 16);
  const luminance = (0.299 * (value >> 16) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255;
  return luminance < 0.35 ? "#e6e9ee" : `#${hex}`;
}

interface TechIconProps {
  name: string;
  categories?: string[];
  className?: string;
}

/** Logo da tecnologia (simple-icons) ou, na falta dela, um ícone genérico da categoria. */
export function TechIcon({ name, categories, className }: TechIconProps) {
  const brand = useTechIcons()?.lookupTechIcon(name);

  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden fill={readableColor(brand.hex)} className={cn("size-3.5 shrink-0", className)}>
        <path d={brand.path} />
      </svg>
    );
  }

  const Fallback = fallbackFor(categories);
  return <Fallback aria-hidden strokeWidth={1.75} className={cn("size-3.5 shrink-0 text-slate-400", className)} />;
}