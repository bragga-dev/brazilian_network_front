import { isAxiosError } from "axios";

import { api } from "@/lib/api";
import type { PageOut } from "@/types/common";
import type { PublicCompanyListItem } from "@/types/company";
import type { Membership, MembershipPlan } from "@/types/membership";
import type { PublicDev } from "@/types/profile";

export const membershipService = {
  async plans(): Promise<MembershipPlan[]> {
    return (await api.get<MembershipPlan[]>("/memberships/plans")).data;
  },

  /** Assinatura em andamento ou cancelada que ainda vale; `null` quando o usuário não tem nenhuma (404). */
  async mine(): Promise<Membership | null> {
    try {
      return (await api.get<Membership>("/memberships/mine")).data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  /** Só o plano: nenhum dado pessoal é pedido. A resposta já traz o Pix; o selo só vem depois do pagamento. */
  async subscribe(input: { plan_id: string }): Promise<Membership> {
    return (await api.post<Membership>("/memberships/", input)).data;
  },

  /** Novo Pix para pagar o primeiro mês (se o anterior venceu) ou renovar o apoio. */
  async newPix(): Promise<Membership> {
    return (await api.post<Membership>("/memberships/mine/pix")).data;
  },

  async cancel(): Promise<Membership> {
    return (await api.delete<Membership>("/memberships/mine")).data;
  },

  async patriotDevs(page = 1, pageSize = 12): Promise<PageOut<PublicDev>> {
    return (await api.get<PageOut<PublicDev>>("/memberships/patriots/devs", { params: { page, page_size: pageSize } })).data;
  },

  async patriotCompanies(page = 1, pageSize = 12): Promise<PageOut<PublicCompanyListItem>> {
    return (await api.get<PageOut<PublicCompanyListItem>>("/memberships/patriots/companies", { params: { page, page_size: pageSize } })).data;
  },
};