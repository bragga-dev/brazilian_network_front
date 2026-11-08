import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "purple" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-linear-to-r from-lime-400 to-flag-yellow text-black shadow-[0_0_24px_-6px_var(--color-flag-yellow)] hover:brightness-110",
  secondary: "border border-white/25 bg-white/[0.03] text-white hover:border-white/50 hover:bg-white/[0.08]",
  purple: "border border-brand-purple/60 bg-brand-purple/10 text-purple-300 hover:bg-brand-purple/20",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "border border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
};

/** Classes do botão — use direto em <Link> quando o botão for navegação. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
    "disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? "Aguarde..." : children}
    </button>
  );
}