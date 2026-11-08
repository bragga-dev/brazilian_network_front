import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountService } from "@/services/account.service";
import { profileService } from "@/services/profile.service";
import type { AddressInput, AddressOwner } from "@/types/profile";

import { useAuth } from "./useAuth";

export const profileKeys = {
  mine: ["profile", "me"] as const,
  public: (devId: string) => ["profile", "public", devId] as const,
  addresses: (owner: AddressOwner) => ["addresses", owner] as const,
  categories: ["profile", "categories"] as const,
  catalog: (q: string, categoryId: string) => ["profile", "catalog", q, categoryId] as const,
};

export function useMyProfile(enabled = true) {
  return useQuery({ queryKey: profileKeys.mine, queryFn: profileService.mine, enabled });
}

export function usePublicProfile(devId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.public(devId ?? ""),
    queryFn: () => profileService.publicProfile(devId as string),
    enabled: Boolean(devId),
    retry: false,
  });
}

/** Qualquer mutação nas seções (formação, experiência, cursos, tecnologias) recarrega o perfil. */
export function useProfileMutation<TInput, TOutput>(fn: (input: TInput) => Promise<TOutput>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.mine }) });
}

/** Mutação em dados do dev/empresa: atualiza o cache e recarrega /auth/me (avatar e nome do header). */
export function useIdentityMutation<TInput, TOutput>(fn: (input: TInput) => Promise<TOutput>) {
  const queryClient = useQueryClient();
  const { refreshMe } = useAuth();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: profileKeys.mine }), refreshMe()]);
    },
  });
}

export function useAddresses(owner: AddressOwner) {
  return useQuery({ queryKey: profileKeys.addresses(owner), queryFn: () => accountService.listAddresses(owner) });
}

export function useAddressMutations(owner: AddressOwner) {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: profileKeys.addresses(owner) });
  return {
    create: useMutation({ mutationFn: (input: AddressInput) => accountService.createAddress(owner, input), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<AddressInput> }) => accountService.updateAddress(owner, id, data),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: string) => accountService.deleteAddress(owner, id), onSuccess }),
    setPreferential: useMutation({ mutationFn: (id: string) => accountService.setPreferentialAddress(owner, id), onSuccess }),
  };
}

export function useTechnologyCatalog(q: string, categoryId: string) {
  return useQuery({
    queryKey: profileKeys.catalog(q, categoryId),
    queryFn: () => profileService.catalog({ q, category_id: categoryId, page_size: 20 }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTechnologyCategories() {
  return useQuery({ queryKey: profileKeys.categories, queryFn: profileService.categories, staleTime: 5 * 60_000 });
}