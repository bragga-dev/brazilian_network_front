import { Navigate } from "react-router-dom";

import { AccountSettings } from "@/components/account/AccountSettings";
import { SectionLabel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";

/** Dev e empresa têm essa área como aba do perfil; esta página existe só para o admin (que não tem perfil). */
export default function AccountPage() {
  const { me } = useAuth();
  if (me && me.user.role !== "admin") return <Navigate to="/perfil?aba=conta" replace />;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel>Minha conta</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Conta e segurança</h1>
      <p className="mt-2 text-slate-400">
        {me?.user.email} · {me?.user.role_label}
      </p>
      <div className="mt-8">
        <AccountSettings />
      </div>
    </div>
  );
}