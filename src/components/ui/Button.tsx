import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-flag-yellow text-black hover:bg-white border border-flag-yellow hover:border-white",
  secondary: "bg-black/60 text-white border border-white/15 hover:border-flag-green hover:text-flag-green",
  ghost: "text-slate-300 border border-transparent hover:text-white hover:bg-white/5",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-5 py-3 text-xs",
};

/** Classes do botão — use direto em <Link> quando o botão for navegação. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-yellow",
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
