import { useQuery } from "@tanstack/react-query";

import { areaService } from "@/services/area.service";

export function useAreas() {
  return useQuery({ queryKey: ["catalog", "areas"], queryFn: areaService.list, staleTime: 30 * 60_000 });
}