import type { ReactNode } from "react";

import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountPanel } from "@/components/account/DeleteAccountPanel";
import { PrivacyPanel } from "@/components/account/PrivacyPanel";
import { SessionsList } from "@/components/account/SessionsList";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel className="p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </Panel>
  );
}

export default function AccountPage() {
  const { me } = useAuth();
  const isAdmin = me?.user.role === "admin";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel>Minha conta</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Conta e segurança</h1>
      <p className="mt-2 text-slate-400">
        {me?.user.email} · {me?.user.role_label}
      </p>

      <div className="mt-8 space-y-5">
        <Section title="Alterar senha">
          <ChangePasswordForm />
        </Section>
        <Section title="Sessões ativas">
          <SessionsList />
        </Section>
        {!isAdmin && (
          <>
            <Section title="Privacidade e dados">
              <PrivacyPanel />
            </Section>
            <Section title="Zona de perigo">
              <DeleteAccountPanel />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}