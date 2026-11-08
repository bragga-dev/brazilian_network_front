import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import type { PublicCompanyListItem } from "@/types/company";

export function CompanyCard({ company }: { company: PublicCompanyListItem }) {
  const location = [company.city, company.state].filter(Boolean).join(" - ");

  return (
    <Link
      to={`/empresas/${company.company_id}`}
      className="group flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-flag-yellow/60 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-3">
        <img src={company.photo_url ?? "/logo.png"} alt="" className="size-12 border border-white/10 bg-black object-cover" />
        <div className="min-w-0">
          <p className="truncate font-medium text-white group-hover:text-flag-yellow">{company.full_name}</p>
          <p className="truncate text-xs text-slate-500">{location || "Local não informado"}</p>
        </div>
      </div>
      {company.bio && <p className="line-clamp-2 text-sm text-slate-400">{company.bio}</p>}
      <div className="mt-auto">
        <Badge tone={company.open_jobs_count > 0 ? "green" : "neutral"}>
          {company.open_jobs_count} {company.open_jobs_count === 1 ? "vaga aberta" : "vagas abertas"}
        </Badge>
      </div>
    </Link>
  );
}
