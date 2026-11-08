import { MapPin } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { REGION_COLORS } from "@/constants/regions";
import type { RegionShare } from "@/hooks/useHomeData";

interface Props {
  regions: RegionShare[];
  companyCount: number;
  sampled: boolean;
  loading: boolean;
}

function donutGradient(regions: RegionShare[]): string {
  let acc = 0;
  const stops = regions
    .filter((r) => r.percent > 0)
    .map((r) => {
      const start = acc;
      acc += r.percent;
      return `${REGION_COLORS[r.region]} ${start}% ${acc}%`;
    });
  return stops.length ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(rgba(255,255,255,0.08) 0 100%)";
}

export function RegionsPanel({ regions, companyCount, sampled, loading }: Props) {
  return (
    <Panel className="flex flex-col p-6">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
        <MapPin className="size-6 text-flag-green" /> Empresas por Região
      </h2>

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-500">Carregando...</p>
      ) : companyCount === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">Ainda não há empresas com localização informada.</p>
      ) : (
        <div className="mt-6 flex flex-1 flex-col items-center gap-6 sm:flex-row">
          <div className="relative size-36 shrink-0 rounded-full" style={{ background: donutGradient(regions) }} role="img" aria-label="Distribuição de empresas por região">
            <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-surface">
              <span className="text-2xl font-bold text-white">{companyCount}</span>
              <span className="text-[11px] text-slate-400">empresas</span>
            </div>
          </div>
          <ul className="w-full space-y-3.5">
            {regions.map(({ region, percent }) => (
              <li key={region} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: REGION_COLORS[region], boxShadow: `0 0 8px ${REGION_COLORS[region]}` }} />
                <span className="flex-1 text-slate-300">{region}</span>
                <span className="font-semibold text-white">{percent.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {sampled && <p className="mt-4 text-[11px] text-slate-600">Calculado sobre as 100 primeiras empresas (ordem alfabética).</p>}
    </Panel>
  );
}