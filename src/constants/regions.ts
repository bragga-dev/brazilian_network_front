import type { RegionKey } from "@/types/home";

/** Cor de cada região no gráfico (hex, usado em conic-gradient). A chave é a mesma de `GET /api/home/`. */
export const REGION_COLORS: Record<RegionKey, string> = {
  sudeste: "#2be05f",
  sul: "#3b82f6",
  nordeste: "#ffe600",
  centro_oeste: "#a855f7",
  norte: "#14b8a6",
};