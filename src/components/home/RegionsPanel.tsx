import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { PatriotAvatar } from "@/components/ui/PatriotAvatar";
import { Panel } from "@/components/ui/Panel";
import { REGION_COLORS, REGION_LABELS, REGION_ORDER } from "@/constants/regions";
import type { RegionShare } from "@/hooks/useHomeData";
import type { RegionKey } from "@/types/home";
import { cn } from "@/utils/cn";

import { BrazilMap } from "./BrazilMap";

interface Props {
  regions: RegionShare[];
  companyCount: number;
  loading: boolean;
}

const pct = (value: number) => `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;

export function RegionsPanel({ regions, companyCount, loading }: Props) {
  const [selected, setSelected] = useState<RegionKey | null>(null);
  const [hovered, setHovered] = useState<RegionKey | null>(null);

  const active = selected ?? (companyCount > 0 ? regions[0]?.region ?? null : null);
  const focus = hovered ?? active;
  const detail = regions.find((region) => region.region === focus);
  const counts = Object.fromEntries(REGION_ORDER.map((key) => [key, regions.find((r) => r.region === key)?.companies_count ?? 0])) as Record<RegionKey, number>;

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-semibold text-white">
            <MapPin className="size-6 text-flag-green" aria-hidden /> Empresas por Região
          </h2>
          <p className="mt-1 text-sm text-slate-400">Explore o mapa e veja onde estão as empresas da rede.</p>
        </div>
        <p className="text-sm text-slate-400">
          <span className="mr-1.5 text-2xl font-bold text-white">{companyCount}</span>
          {companyCount === 1 ? "empresa com localização" : "empresas com localização"}
        </p>
      </div>

      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <BrazilMap counts={counts} active={active} onSelect={setSelected} onHover={setHovered} />

        <div className="space-y-5">
          <ul className="space-y-1.5" aria-label="Regiões">
            {regions.map((region) => {
              const isFocus = focus === region.region;
              return (
                <li key={region.region}>
                  <button
                    type="button"
                    aria-pressed={active === region.region}
                    onClick={() => setSelected(region.region)}
                    onMouseEnter={() => setHovered(region.region)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn("w-full rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-flag-green", isFocus ? "bg-white/[0.07]" : "hover:bg-white/[0.04]")}
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: REGION_COLORS[region.region], boxShadow: `0 0 8px ${REGION_COLORS[region.region]}` }} />
                      <span className="flex-1 font-medium text-slate-200">{REGION_LABELS[region.region]}</span>
                      <span className="font-semibold text-white">{region.companies_count}</span>
                      <span className="w-12 text-right text-xs text-slate-500">{pct(region.percent)}</span>
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${region.percent}%`, background: REGION_COLORS[region.region] }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-500">Carregando...</p>
            ) : companyCount === 0 || !detail ? (
              <p className="py-6 text-center text-sm text-slate-500">Ainda não há empresas com localização informada.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{REGION_LABELS[detail.region]}</p>
                  <div className="flex gap-2">
                    <Badge tone="neutral">{detail.companies_count} empresas</Badge>
                    <Badge tone="green">{detail.open_jobs_count} vagas abertas</Badge>
                  </div>
                </div>
                {detail.companies.length > 0 ? (
                  <ul className="mt-3 divide-y divide-white/10">
                    {detail.companies.slice(0, 4).map((company) => (
                      <li key={company.company_id}>
                        <Link to={`/empresas/${company.company_id}`} className="group flex items-center gap-3 py-2.5">
                          <PatriotAvatar shape="square" name={company.full_name} url={company.photo_url} patriot={company.is_patriot} className="size-10" textClassName="text-base" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white group-hover:text-flag-green">{company.full_name}</span>
                            <span className="block truncate text-xs text-slate-500">{[company.city, company.state].filter(Boolean).join(" - ") || "Local não informado"}</span>
                          </span>
                          <span className="shrink-0 text-xs text-slate-400">{company.open_jobs_count} vagas</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-5 text-center text-sm text-slate-500">Nenhuma empresa nesta região ainda.</p>
                )}
                <Link to="/empresas" className="mt-3 flex items-center gap-1 text-sm font-medium text-flag-blue hover:text-white">
                  Explorar todas as empresas <ArrowRight className="size-4" aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}