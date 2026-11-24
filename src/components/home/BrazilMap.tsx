import { useState } from "react";

import { BRAZIL_STATES, BRAZIL_VIEWBOX } from "@/constants/brazilMap";
import { REGION_COLORS, REGION_LABELS, REGION_OF_UF } from "@/constants/regions";
import type { RegionKey } from "@/types/home";

interface Props {
  counts: Record<RegionKey, number>;
  active: RegionKey | null;
  onSelect: (region: RegionKey) => void;
  onHover: (region: RegionKey | null) => void;
}

const LABEL_MIN_SIZE = 26;

/** Mapa do Brasil por estados, colorido por região. Hover/foco destaca a região inteira; clique/Enter seleciona. */
export function BrazilMap({ counts, active, onSelect, onHover }: Props) {
  const [hoverUf, setHoverUf] = useState<string | null>(null);
  const hoverRegion = hoverUf ? REGION_OF_UF[hoverUf] : null;
  const focus = hoverRegion ?? active;
  const hoverState = BRAZIL_STATES.find((state) => state.uf === hoverUf);

  const enter = (uf: string) => {
    setHoverUf(uf);
    onHover(REGION_OF_UF[uf]);
  };
  const leave = () => {
    setHoverUf(null);
    onHover(null);
  };

  return (
    <div className="relative">
      <svg viewBox={BRAZIL_VIEWBOX} className="mx-auto h-auto max-h-[560px] w-full" role="group" aria-label="Mapa do Brasil com empresas por região">
        <g>
          {BRAZIL_STATES.map((state) => {
            const region = REGION_OF_UF[state.uf];
            const empty = counts[region] === 0;
            const highlighted = focus === region;
            const opacity = empty ? 0.14 : state.uf === hoverUf ? 1 : highlighted ? (hoverUf ? 0.6 : 0.95) : focus ? 0.3 : 0.62;
            return (
              <path
                key={state.uf}
                d={state.path}
                role="button"
                tabIndex={0}
                aria-label={`${state.name}, região ${REGION_LABELS[region]}: ${counts[region]} empresas`}
                aria-pressed={active === region}
                fill={REGION_COLORS[region]}
                fillOpacity={opacity}
                stroke="#04070b"
                strokeWidth={1.2}
                strokeLinejoin="round"
                className="cursor-pointer outline-none transition-[fill-opacity] duration-200"
                onMouseEnter={() => enter(state.uf)}
                onMouseLeave={leave}
                onFocus={() => enter(state.uf)}
                onBlur={leave}
                onClick={() => onSelect(region)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(region);
                  }
                }}
              />
            );
          })}
        </g>

        {/* Contornos em camadas separadas, sem capturar o mouse (evita flicker de hover): região em foco e, por cima, o estado sob o cursor. */}
        <g pointerEvents="none" fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth={hoverUf ? 1 : 1.8} strokeOpacity={hoverUf ? 0.55 : 1}>
          {focus &&
            BRAZIL_STATES.filter((state) => REGION_OF_UF[state.uf] === focus && state.uf !== hoverUf).map((state) => (
              <path key={state.uf} d={state.path} style={{ filter: `drop-shadow(0 0 6px ${REGION_COLORS[focus]})` }} />
            ))}
        </g>
        {hoverState && (
          <path d={hoverState.path} pointerEvents="none" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${REGION_COLORS[REGION_OF_UF[hoverState.uf]]})` }} />
        )}

        <g pointerEvents="none" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="#fff" stroke="rgba(0,0,0,0.65)" strokeWidth={3} paintOrder="stroke">
          {BRAZIL_STATES.filter((state) => state.size >= LABEL_MIN_SIZE).map((state) => (
            <text key={state.uf} x={state.cx} y={state.cy}>
              {state.uf}
            </text>
          ))}
        </g>
      </svg>

      <div className="pointer-events-none absolute left-0 top-0 min-h-12 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs backdrop-blur" aria-hidden>
        {hoverState ? (
          <>
            <p className="font-semibold text-white">{hoverState.name}</p>
            <p className="text-slate-400">
              {REGION_LABELS[REGION_OF_UF[hoverState.uf]]} · {counts[REGION_OF_UF[hoverState.uf]]} empresas
            </p>
          </>
        ) : (
          <p className="max-w-36 text-slate-400">Passe o mouse ou toque numa região</p>
        )}
      </div>
    </div>
  );
}