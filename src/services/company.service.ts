import { api } from "@/lib/api";
import type { PageOut } from "@/types/common";
import type { CompanyFilters, PublicCompanyListItem, PublicCompanyProfile } from "@/types/company";

import { cleanParams } from "./job.service";

export const companyService = {
  async list(filters: CompanyFilters = {}): Promise<PageOut<PublicCompanyListItem>> {
    const { data } = await api.get<PageOut<PublicCompanyListItem>>("/companies/", { params: cleanParams(filters) });
    return data;
  },

  async get(companyId: string, page = 1, pageSize = 10): Promise<PublicCompanyProfile> {
    const { data } = await api.get<PublicCompanyProfile>(`/companies/${companyId}`, {
      params: { page, page_size: pageSize },
    });
    return data;
  },
};
