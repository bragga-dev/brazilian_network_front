import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { membershipService } from "@/services/membership.service";

import { useAuth } from "./useAuth";

export const usePlans = () => useQuery({ queryKey: ["membership", "plans"], queryFn: membershipService.plans, staleTime: 10 * 60_000 });

/** Só dev e empresa verificados têm assinatura. */
export function useMyMembership() {
  const { me } = useAuth();
  const eligible = Boolean(me && me.user.role !== "admin" && me.user.is_active && me.user.is_trusty);
  return useQuery({ queryKey: ["membership", "mine", me?.user.user_id], queryFn: membershipService.mine, enabled: eligible });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipService.subscribe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["membership", "mine"] }),
  });
}

export function useCancelMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipService.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["membership", "mine"] }),
  });
}

export const usePatriotDevs = (page: number) =>
  useQuery({ queryKey: ["membership", "patriot-devs", page], queryFn: () => membershipService.patriotDevs(page), placeholderData: keepPreviousData });

export const usePatriotCompanies = (page: number) =>
  useQuery({ queryKey: ["membership", "patriot-companies", page], queryFn: () => membershipService.patriotCompanies(page), placeholderData: keepPreviousData });