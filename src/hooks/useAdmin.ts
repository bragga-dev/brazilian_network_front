import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/services/admin.service";
import type { AdminContactFilters, AdminUserFilters } from "@/types/admin";

export const adminKeys = {
  all: ["admin"] as const,
  users: (filters: AdminUserFilters) => [...adminKeys.all, "users", filters] as const,
  userDetail: (id: string) => [...adminKeys.all, "user", id] as const,
  contacts: (filters: AdminContactFilters) => [...adminKeys.all, "contacts", filters] as const,
  reviews: (page: number) => [...adminKeys.all, "reviews", page] as const,
  campaigns: (page: number) => [...adminKeys.all, "campaigns", page] as const,
  campaignImages: (id: string) => [...adminKeys.all, "campaign-images", id] as const,
};

export const useAdminUsers = (filters: AdminUserFilters) =>
  useQuery({ queryKey: adminKeys.users(filters), queryFn: () => adminService.users.list(filters), placeholderData: keepPreviousData });

export const useAdminUserDetail = (userId: string | null) =>
  useQuery({ queryKey: adminKeys.userDetail(userId ?? ""), queryFn: () => adminService.users.detail(userId as string), enabled: Boolean(userId) });

export const useAdminContacts = (filters: AdminContactFilters) =>
  useQuery({ queryKey: adminKeys.contacts(filters), queryFn: () => adminService.contacts.list(filters), placeholderData: keepPreviousData });

export const useReportedReviews = (page: number) =>
  useQuery({ queryKey: adminKeys.reviews(page), queryFn: () => adminService.reviews.reported({ page }), placeholderData: keepPreviousData });

export const useAdminCampaigns = (page: number) =>
  useQuery({ queryKey: adminKeys.campaigns(page), queryFn: () => adminService.campaigns.list({ page }), placeholderData: keepPreviousData });

export const useCampaignImages = (campaignId: string | null) =>
  useQuery({ queryKey: adminKeys.campaignImages(campaignId ?? ""), queryFn: () => adminService.campaigns.images.list(campaignId as string), enabled: Boolean(campaignId) });

/** Qualquer mudança do admin recarrega as listas dele (e a home, que mostra campanhas). */
function useRefresh(extra: string[] = []) {
  const queryClient = useQueryClient();
  return () => Promise.all([adminKeys.all, ...extra.map((key) => [key])].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useAdminUserMutations() {
  const refresh = useRefresh();
  const onSuccess = () => refresh();
  return {
    deactivate: useMutation({ mutationFn: adminService.users.deactivate, onSuccess }),
    reactivate: useMutation({ mutationFn: adminService.users.reactivate, onSuccess }),
  };
}

export function useAdminContactMutations() {
  const refresh = useRefresh();
  const onSuccess = () => refresh();
  return {
    setStatus: useMutation({ mutationFn: adminService.contacts.setStatus, onSuccess }),
    remove: useMutation({ mutationFn: adminService.contacts.remove, onSuccess }),
  };
}

export function useAdminReviewMutations() {
  const refresh = useRefresh();
  return { setCommentHidden: useMutation({ mutationFn: adminService.reviews.setCommentHidden, onSuccess: () => refresh() }) };
}

export function useAdminCampaignMutations() {
  const refresh = useRefresh(["home", "campaigns"]);
  const onSuccess = () => refresh();
  return {
    create: useMutation({ mutationFn: adminService.campaigns.create, onSuccess }),
    update: useMutation({ mutationFn: adminService.campaigns.update, onSuccess }),
    remove: useMutation({ mutationFn: adminService.campaigns.remove, onSuccess }),
    activate: useMutation({ mutationFn: adminService.campaigns.activate, onSuccess }),
    deactivate: useMutation({ mutationFn: adminService.campaigns.deactivate, onSuccess }),
    uploadImage: useMutation({ mutationFn: adminService.campaigns.images.upload, onSuccess }),
    updateImage: useMutation({ mutationFn: adminService.campaigns.images.update, onSuccess }),
    removeImage: useMutation({ mutationFn: adminService.campaigns.images.remove, onSuccess }),
    setCover: useMutation({ mutationFn: adminService.campaigns.images.setCover, onSuccess }),
  };
}