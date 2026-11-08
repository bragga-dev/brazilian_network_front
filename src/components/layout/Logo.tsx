import { Link } from "react-router-dom";

/** </> em degradê (azul → verde → amarelo) + wordmark. */
export function LogoMark({ className = "h-7 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 28" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="bn-logo" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="0.5" stopColor="#2be05f" />
          <stop offset="1" stopColor="#ffe600" />
        </linearGradient>
      </defs>
      <path d="M10 5 2 14l8 9M26 5l8 9-8 9M21 2 15 26" stroke="url(#bn-logo)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Brazilian Network — início">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-white">
        Brazilian <span className="text-flag-green">Network</span>
      </span>
    </Link>
  );
}