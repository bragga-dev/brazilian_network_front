import { cn } from "@/utils/cn";

interface Props {
  name: string;
  url?: string | null;
  className?: string;
}

/** Logo da empresa; sem foto, mostra a inicial num bloco em degradê. */
export function CompanyLogo({ name, url, className }: Props) {
  if (url) {
    return <img src={url} alt="" loading="lazy" className={cn("shrink-0 rounded-xl border border-white/10 bg-black object-cover", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-flag-green/80 via-flag-blue/70 to-brand-purple/80 font-bold text-white",
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}