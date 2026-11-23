import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/profile.service";
import type { DevFilters } from "@/types/profile";

export function useDevs(filters: DevFilters) {
  return useQuery({
    queryKey: ["devs", "list", filters],
    queryFn: () => profileService.listDevs(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * Tecnologias do catálogo para o filtro da listagem (o backend limita a página em 100).
 * O catálogo exige login (401 para visitante), então só carrega quando há sessão.
 */
export function useTechnologyOptions(enabled: boolean) {
  return useQuery({
    queryKey: ["profile", "catalog", "options"],
    queryFn: () => profileService.catalog({ page_size: 100 }),
    staleTime: 10 * 60_000,
    select: (page) => page.items,
    enabled,
  });
}