import type { CompanyProfile, Me } from "@/types/auth";

export type ProfileTab = "dados" | "enderecos";

export interface RequiredCompletion {
  /** Rótulos dos campos obrigatórios que ainda faltam. */
  missing: string[];
  /** Aba de /perfil onde o usuário resolve o primeiro pendente. */
  tab: ProfileTab;
  message: string;
}

export const COMPANY_REQUIRED = ["Nome fantasia", "Razão social", "CNPJ", "Sobre a empresa"] as const;

/** Empresa não tem gate no backend: estes são os dados mínimos para o perfil público fazer sentido. */
export function companyMissingFields(company: CompanyProfile): string[] {
  const filled: Record<(typeof COMPANY_REQUIRED)[number], boolean> = {
    "Nome fantasia": Boolean(company.full_name?.trim()),
    "Razão social": Boolean(company.legal_name?.trim()),
    CNPJ: Boolean(company.cnpj?.trim()),
    "Sobre a empresa": Boolean(company.bio.trim()),
  };
  return COMPANY_REQUIRED.filter((label) => !filled[label]);
}

const list = (items: string[]) => items.join(", ").replace(/, ([^,]*)$/, " e $1");

/** O que falta para o dev se candidatar (regra do backend) ou para a empresa ter perfil utilizável. `null` = nada pendente. */
export function getRequiredCompletion(me: Me): RequiredCompletion | null {
  if (me.dev && me.profile_completion) {
    const { missing } = me.profile_completion;
    if (missing.length === 0) return null;
    return {
      missing,
      tab: missing.every((label) => label === "Endereço") ? "enderecos" : "dados",
      message: `Complete seu perfil para se candidatar: falta ${list(missing)}.`,
    };
  }
  if (me.company) {
    const missing = companyMissingFields(me.company);
    if (missing.length === 0) return null;
    return { missing, tab: "dados", message: `Complete os dados da empresa: falta ${list(missing)}.` };
  }
  return null;
}