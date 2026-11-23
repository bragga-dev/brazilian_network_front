import { MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { TechBadge } from "@/components/ui/TechBadge";
import type { PublicDevListItem } from "@/types/profile";

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt="" loading="lazy" className="size-14 shrink-0 rounded-full border border-white/15 object-cover" />;
  return (
    <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-flag-green to-flag-blue text-xl font-bold text-black">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function DevCard({ dev }: { dev: PublicDevListItem }) {
  const location = [dev.city, dev.state].filter(Boolean).join(" - ");
  const extra = dev.technologies_count - dev.technologies.length;

  return (
    <Link
      to={`/devs/${dev.dev_id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] p-5 transition hover:border-flag-green/50 hover:from-white/[0.07]"
    >
      <div className="flex items-center gap-3">
        <Avatar name={dev.full_name} url={dev.photo_url} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white group-hover:text-flag-green">{dev.full_name}</p>
          <p className="truncate text-sm text-slate-400">{dev.headline || "Dev"}</p>
          {location && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="size-3" aria-hidden /> {location}
            </p>
          )}
        </div>
      </div>

      {dev.bio && <p className="line-clamp-2 text-sm text-slate-400">{dev.bio}</p>}

      <div className="mt-auto flex flex-wrap gap-2">
        {dev.is_patriot && (
          <Badge tone="yellow" icon={<ShieldCheck className="size-3" />}>
            Patriota
          </Badge>
        )}
        {dev.technologies.map((technology) => (
          <TechBadge key={technology.technology_id} technology={technology} />
        ))}
        {extra > 0 && <Badge>+{extra}</Badge>}
      </div>
    </Link>
  );
}