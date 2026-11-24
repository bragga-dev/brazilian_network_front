import type { RegionKey } from "@/types/home";

/** Cor de cada região (hex). A chave é a mesma de `GET /api/home/`. */
export const REGION_COLORS: Record<RegionKey, string> = {
  sudeste: "#2be05f",
  sul: "#3b82f6",
  nordeste: "#ffe600",
  centro_oeste: "#a855f7",
  norte: "#14b8a6",
};

export const REGION_LABELS: Record<RegionKey, string> = {
  sudeste: "Sudeste",
  sul: "Sul",
  nordeste: "Nordeste",
  centro_oeste: "Centro-Oeste",
  norte: "Norte",
};

export const REGION_ORDER: RegionKey[] = ["sudeste", "nordeste", "sul", "centro_oeste", "norte"];

export const REGION_OF_UF: Record<string, RegionKey> = {
  AC: "norte", AP: "norte", AM: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste", PE: "nordeste", PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro_oeste", GO: "centro_oeste", MT: "centro_oeste", MS: "centro_oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};