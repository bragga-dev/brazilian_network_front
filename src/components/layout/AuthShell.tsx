import type { ReactNode } from "react";

import { Panel, SectionLabel } from "@/components/ui/Panel";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ label, title, subtitle, children, footer }: Props) {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-beams pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-md px-4 py-16">
        <Panel className="bg-black/60 p-7 shadow-2xl">
          <SectionLabel>{label}</SectionLabel>
          <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Panel>
        {footer && <div className="mt-5 text-center text-sm text-slate-400">{footer}</div>}
      </div>
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          : "rounded-lg border border-flag-green/30 bg-flag-green/10 px-3 py-2 text-sm text-green-300"
      }
    >
      {children}
    </p>
  );
}