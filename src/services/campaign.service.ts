import { api } from "@/lib/api";
import type { AdminCampaign, CampaignImage } from "@/types/admin";
import type { PageOut } from "@/types/common";

/** Endpoints públicos (sem login): só campanhas ativas e dentro da vigência. */
export const campaignService = {
  list: async () => (await api.get<PageOut<AdminCampaign>>("/campaigns/", { params: { active_only: true } })).data,
  images: async (campaignId: string) => (await api.get<CampaignImage[]>(`/campaigns/${campaignId}/images`)).data,
};