import { api } from "@/lib/api";
import type {
  AdminCampaign,
  AdminContact,
  AdminContactFilters,
  AdminReview,
  AdminUser,
  AdminUserDetail,
  AdminUserFilters,
  CampaignImage,
  CampaignImageUpdate,
  CampaignInput,
  ContactStatus,
} from "@/types/admin";
import type { User } from "@/types/auth";
import type { PageOut } from "@/types/common";

import { cleanParams } from "./job.service";

/** Tudo aqui exige role admin no backend (403 para os demais). */
export const adminService = {
  users: {
    list: async (filters: AdminUserFilters = {}) => (await api.get<PageOut<AdminUser>>("/admin/list-users", { params: cleanParams(filters) })).data,
    detail: async (userId: string) => (await api.get<AdminUserDetail>(`/admin/detail-user/${userId}`)).data,
    deactivate: async (userId: string) => (await api.post<User>(`/auth/deactive-user/${userId}`)).data,
    reactivate: async (userId: string) => (await api.post<User>(`/auth/reactivate-user/${userId}`)).data,
  },

  contacts: {
    list: async (filters: AdminContactFilters = {}) => (await api.get<PageOut<AdminContact>>("/contact/", { params: cleanParams(filters) })).data,
    setStatus: async ({ id, status }: { id: string; status: ContactStatus }) => (await api.patch<AdminContact>(`/contact/${id}`, { status })).data,
    remove: async (id: string) => {
      await api.delete(`/contact/${id}`);
    },
  },

  reviews: {
    reported: async (params: { page?: number; page_size?: number } = {}) => (await api.get<PageOut<AdminReview>>("/reviews/admin/reported", { params: cleanParams(params) })).data,
    setCommentHidden: async ({ id, hidden }: { id: string; hidden: boolean }) => (await api.patch<AdminReview>(`/reviews/admin/${id}/comment`, { hidden })).data,
  },

  campaigns: {
    // O endpoint de listagem é público; `active_only=false` traz também as desativadas.
    list: async (params: { page?: number; page_size?: number } = {}) =>
      (await api.get<PageOut<AdminCampaign>>("/campaigns/", { params: { ...cleanParams(params), active_only: false } })).data,
    create: async (input: CampaignInput) => (await api.post<AdminCampaign>("/campaigns/", input)).data,
    update: async ({ id, data }: { id: string; data: Partial<CampaignInput> }) => (await api.patch<AdminCampaign>(`/campaigns/${id}`, data)).data,
    remove: async (id: string) => {
      await api.delete(`/campaigns/${id}`);
    },
    activate: async (id: string) => (await api.post<AdminCampaign>(`/campaigns/${id}/activate`)).data,
    deactivate: async (id: string) => (await api.post<AdminCampaign>(`/campaigns/${id}/deactivate`)).data,

    images: {
      list: async (campaignId: string) => (await api.get<CampaignImage[]>(`/campaigns/${campaignId}/images`)).data,
      // `is_cover` e `display_order` são query params no backend (o corpo só leva o arquivo).
      upload: async ({ campaignId, file, isCover, displayOrder }: { campaignId: string; file: File; isCover: boolean; displayOrder: number }) => {
        const body = new FormData();
        body.append("image", file);
        return (
          await api.post<CampaignImage>(`/campaigns/${campaignId}/images`, body, {
            params: { is_cover: isCover, display_order: displayOrder },
          })
        ).data;
      },
      update: async ({ id, data }: { id: string; data: CampaignImageUpdate }) => (await api.patch<CampaignImage>(`/campaigns/images/${id}`, data)).data,
      remove: async (id: string) => {
        await api.delete(`/campaigns/images/${id}`);
      },
      setCover: async (id: string) => (await api.post<CampaignImage>(`/campaigns/images/${id}/set-cover`)).data,
    },
  },
};