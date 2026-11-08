import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/utils/cn";

const CONTROL =
  "w-full border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 " +
  "focus:border-flag-green focus:outline-none focus:ring-1 focus:ring-flag-green";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, children, className }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
