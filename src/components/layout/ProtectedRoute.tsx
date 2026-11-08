import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Spinner } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

/** Exige login (e, opcionalmente, uma role). Anônimo vai para /entrar e volta para cá depois. */
export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { status, me } = useAuth();
  const location = useLocation();

  if (status === "loading") return <Spinner />;
  if (status === "anonymous") {
    return <Navigate to="/entrar" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (roles && me && !roles.includes(me.user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}