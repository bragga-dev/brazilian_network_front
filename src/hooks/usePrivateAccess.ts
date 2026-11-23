import { useAuth } from "./useAuth";

/** Mesma regra do backend para ver vagas/projetos completos: admin, ou usuário ativo com e-mail verificado. */
export function usePrivateAccess(): boolean {
  const { me } = useAuth();
  return Boolean(me && (me.user.role === "admin" || (me.user.is_active && me.user.is_trusty)));
}