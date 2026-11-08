import type { ContractType, ExperienceLevel, JobOrder, WorkModel } from "@/types/job";

export const CONTRACT_OPTIONS: { value: ContractType; label: string }[] = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "Pessoa Jurídica" },
  { value: "freelance", label: "Freelancer" },
  { value: "internship", label: "Estágio" },
  { value: "temporary", label: "Temporário" },
];

export const WORK_MODEL_OPTIONS: { value: WorkModel; label: string }[] = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
];

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "any", label: "Qualquer nível" },
];

export const ORDER_OPTIONS: { value: JobOrder; label: string }[] = [
  { value: "-published_at", label: "Mais recentes" },
  { value: "-salary_max", label: "Maior remuneração" },
];

export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
