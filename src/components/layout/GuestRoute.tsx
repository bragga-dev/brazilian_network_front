import { Navigate, Outlet } from "react-router-dom";

import { Spinner } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";

/** Telas de login/cadastro: quem já está logado volta para a home. */
export function GuestRoute() {
  const { status } = useAuth();
  if (status === "loading") return <Spinner />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <Outlet />;
}
