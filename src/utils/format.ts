import type { Job } from "@/types/job";
import type { Project } from "@/types/project";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const PERIOD_SUFFIX: Record<Job["pay_period"], string> = {
  monthly: "/mês",
  hourly: "/hora",
  project: "/projeto",
};

export function formatSalary(job: Pick<Job, "salary_min" | "salary_max" | "pay_period" | "salary_visible">): string {
  const min = job.salary_min !== null ? Number(job.salary_min) : null;
  const max = job.salary_max !== null ? Number(job.salary_max) : null;
  if (!job.salary_visible || (min === null && max === null)) return "A combinar";

  const suffix = PERIOD_SUFFIX[job.pay_period];
  if (min !== null && max !== null) {
    return min === max ? `${currency.format(min)}${suffix}` : `${currency.format(min)} – ${currency.format(max)}${suffix}`;
  }
  if (max !== null) return `Até ${currency.format(max)}${suffix}`;
  return `A partir de ${currency.format(min as number)}${suffix}`;
}

export function formatLocation(job: Pick<Job, "work_model" | "city" | "state">): string {
  if (job.work_model === "remote") return "Remoto";
  return [job.city, job.state].filter(Boolean).join(" - ");
}

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return rtf.format(Math.round(days / 30), "month");
}

export function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
}

const MINUTE = 60_000;

/** "há 12 min", "há 3 h", "há 2 d" — para feeds de atividade. */
export function formatTimeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / MINUTE);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  return `há ${Math.floor(days / 30)} m`;
}

export function formatProjectValue(project: Pick<Project, "min_value" | "max_value" | "value_visible">): string {
  const min = project.min_value !== null ? Number(project.min_value) : null;
  const max = project.max_value !== null ? Number(project.max_value) : null;
  if (!project.value_visible || (min === null && max === null)) return "A combinar";
  if (min !== null && max !== null) {
    return min === max ? currency.format(min) : `${currency.format(min)} – ${currency.format(max)}`;
  }
  if (max !== null) return `Até ${currency.format(max)}`;
  return `A partir de ${currency.format(min as number)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2024-03-15" -> "mar/2024" (sem passar por Date: evita deslocamento de fuso). */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const [year, month] = iso.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""}/${year}`;
}

export function formatPeriod(start: string | null | undefined, end: string | null | undefined, current = false): string {
  const from = formatMonthYear(start);
  const to = current ? "atual" : formatMonthYear(end);
  return [from, to].filter(Boolean).join(" – ");
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}