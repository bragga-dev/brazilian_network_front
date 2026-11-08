export type Region = "Sudeste" | "Sul" | "Nordeste" | "Centro-Oeste" | "Norte";

export const STATE_REGION: Record<string, Region> = {
  AC: "Norte", AP: "Norte", AM: "Norte", PA: "Norte", RO: "Norte", RR: "Norte", TO: "Norte",
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste",
  PE: "Nordeste", PI: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste",
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  PR: "Sul", RS: "Sul", SC: "Sul",
};

/** Cor de cada região no gráfico (hex, usado em conic-gradient). */
export const REGION_COLORS: Record<Region, string> = {
  Sudeste: "#2be05f",
  Sul: "#3b82f6",
  Nordeste: "#ffe600",
  "Centro-Oeste": "#a855f7",
  Norte: "#14b8a6",
};

export const REGIONS = Object.keys(REGION_COLORS) as Region[];