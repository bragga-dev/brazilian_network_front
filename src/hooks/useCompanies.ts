import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { companyService } from "@/services/company.service";
import type { CompanyFilters } from "@/types/company";

export const companyKeys = {
  all: ["companies"] as const,
  list: (filters: CompanyFilters) => [...companyKeys.all, "list", filters] as const,
  detail: (id: string, page: number) => [...companyKeys.all, "detail", id, page] as const,
};

export function useCompanies(filters: CompanyFilters) {
  return useQuery({
    queryKey: companyKeys.list(filters),
    queryFn: () => companyService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCompany(companyId: string | undefined, page = 1) {
  return useQuery({
    queryKey: companyKeys.detail(companyId ?? "", page),
    queryFn: () => companyService.get(companyId as string, page),
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  });
}
