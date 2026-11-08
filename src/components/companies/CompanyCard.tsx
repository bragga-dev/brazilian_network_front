import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import type { PublicCompanyListItem } from "@/types/company";

export function CompanyCard({ company }: { company: PublicCompanyListItem }) {
  const location = [company.city, company.state].filter(Boolean).join(" - ");

  return (
    <Link
      to={`/empresas/${company.company_id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.05] to-white/[0.015] p-5 transition hover:border-flag-green/50 hover:from-white/[0.07]"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo name={company.full_name} url={company.photo_url} className="size-12 text-lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-white group-hover:text-flag-green">{company.full_name}</p>
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