import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Brazilian Network — início">
      <img src="/logo.png" alt="" className="size-9 object-contain" />
      <span className="font-mono text-sm font-semibold uppercase tracking-wider text-white">
        Brazilian<span className="text-flag-green">_</span>
        <span className="text-flag-yellow">Network</span>
      </span>
    </Link>
  );
}
