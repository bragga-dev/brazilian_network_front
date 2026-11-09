import type { ReactNode } from "react";

import { Panel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";

import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountPanel } from "./DeleteAccountPanel";
import { PrivacyPanel } from "./PrivacyPanel";
import { SessionsList } from "./SessionsList";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </Panel>
  );
}

/** Segurança e privacidade da conta. Usado na aba "Conta e segurança" do perfil (dev/empresa) e na página do admin. */
export function AccountSettings() {
  const { me } = useAuth();
  const isAdmin = me?.user.role === "admin";

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Section title="Alterar senha">
          <ChangePasswordForm />
        </Section>
        {!isAdmin && (
          <Section title="Zona de perigo">
            <DeleteAccountPanel />
          </Section>
        )}
      </div>
      <div className="space-y-5">
        <Section title="Sessões ativas">
          <SessionsList />
        </Section>
        {!isAdmin && (
          <Section title="Privacidade e dados">
            <PrivacyPanel />
          </Section>
        )}
      </div>
    </div>
  );
}