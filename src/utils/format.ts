import type { Job } from "@/types/job";

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
