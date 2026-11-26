import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { membershipService } from "@/services/membership.service";

import { useAuth } from "./useAuth";

export const usePlans = () => useQuery({ queryKey: ["membership", "plans"], queryFn: membershipService.plans, staleTime: 10 * 60_000 });

/** Só dev e empresa verificados têm assinatura. Com um Pix em aberto, consulta a cada 10 s. */
export function useMyMembership() {
  const { me } = useAuth();
  const eligible = Boolean(me && me.user.role !== "admin" && me.user.is_active && me.user.is_trusty);
  return useQuery({
    queryKey: ["membership", "mine", me?.user.user_id],
    queryFn: membershipService.mine,
    enabled: eligible,
    // Pix em aberto: o webhook confirma o pagamento sozinho, então a tela acompanha até confirmar.
    refetchInterval: (query) => (query.state.data?.pix_copy_paste ? 10_000 : false),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipService.subscribe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["membership", "mine"] }),
  });
}

export function useNewPix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipService.newPix,
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