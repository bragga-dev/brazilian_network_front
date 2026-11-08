import type { CourseType, EducationLevel, EmploymentType, Proficiency, ProgressStatus } from "@/types/profile";

type Option<T extends string> = { value: T; label: string };

export const EDUCATION_LEVEL_OPTIONS: Option<EducationLevel>[] = [
  { value: "elementary", label: "Ensino Fundamental" },
  { value: "high_school", label: "Ensino Médio" },
  { value: "technical", label: "Técnico" },
  { value: "undergraduate", label: "Graduação" },
  { value: "postgraduate", label: "Pós-graduação" },
  { value: "mba", label: "MBA" },
  { value: "masters", label: "Mestrado" },
  { value: "doctorate", label: "Doutorado" },
  { value: "postdoctorate", label: "Pós-doutorado" },
];

export const PROGRESS_STATUS_OPTIONS: Option<ProgressStatus>[] = [
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluído" },
  { value: "interrupted", label: "Interrompido" },
];

export const EMPLOYMENT_TYPE_OPTIONS: Option<EmploymentType>[] = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "Pessoa Jurídica" },
  { value: "internship", label: "Estágio" },
  { value: "freelance", label: "Freelancer" },
  { value: "self_employed", label: "Autônomo" },
  { value: "volunteer", label: "Voluntário" },
  { value: "temporary", label: "Temporário" },
  { value: "apprentice", label: "Jovem Aprendiz" },
];

export const COURSE_TYPE_OPTIONS: Option<CourseType>[] = [
  { value: "free_course", label: "Curso livre" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "workshop", label: "Workshop" },
  { value: "certification", label: "Certificação" },
  { value: "training", label: "Capacitação" },
  { value: "conference", label: "Conferência" },
  { value: "seminar", label: "Seminário" },
];

export const PROFICIENCY_OPTIONS: Option<Proficiency>[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
  { value: "expert", label: "Especialista" },
];

/** Posição (0–3) para desenhar a barrinha de proficiência. */
export const PROFICIENCY_RANK: Record<Proficiency, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

export const GENDER_OPTIONS = ["Masculino", "Feminino", "Outro"] as const;

export const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};