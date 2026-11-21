import type { LucideIcon, LucideProps } from "lucide-react";

import { cn } from "@/utils/cn";

/** Escala única de tamanhos: evita size-3/3.5/4/5/6/9/10 espalhados pelo código. */
const SIZES = {
  xs: "size-3.5", // dentro de Badge
  sm: "size-4", // texto corrido, botões, menus
  md: "size-5", // cabeçalhos de item
  lg: "size-6", // títulos de painel
  xl: "size-10", // números de destaque (StatsBar, Stat)
} as const;

export type IconSize = keyof typeof SIZES;

interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: IconSize;
}

/** Wrapper dos ícones Lucide: tamanho e espessura de traço padronizados, sempre decorativo (aria-hidden). */
export function Icon({ icon: Glyph, size = "sm", className, ...props }: IconProps) {
  return <Glyph aria-hidden className={cn("shrink-0", SIZES[size], className)} strokeWidth={size === "xl" ? 1.5 : 1.75} {...props} />;
}