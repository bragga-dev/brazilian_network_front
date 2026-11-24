import { useId } from "react";

import { cn } from "@/utils/cn";

/** Bandeira do Brasil em SVG (proporção 32:22), com brilho sutil e cantos arredondados. */
export function BrazilFlag({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 22" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect width="32" height="22" rx="3.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="32" height="22" fill="#009c3b" />
        <path d="M16 2.2 29.4 11 16 19.8 2.6 11Z" fill="#ffdf00" />
        <circle cx="16" cy="11" r="5.6" fill="#002776" />
        <path d="M10.6 9.6C13.4 8.6 18.6 9 21.3 11.6" stroke="#fff" strokeWidth="1.1" fill="none" />
        <g fill="#fff">
          <circle cx="13.2" cy="12.7" r="0.35" />
          <circle cx="15.2" cy="13.9" r="0.35" />
          <circle cx="17.6" cy="13.2" r="0.35" />
          <circle cx="14.2" cy="10.9" r="0.35" />
          <circle cx="18.4" cy="11.6" r="0.3" />
          <circle cx="16.2" cy="12.2" r="0.3" />
        </g>
        <rect width="32" height="22" fill={`url(#${uid}-gloss)`} />
      </g>
    </svg>
  );
}