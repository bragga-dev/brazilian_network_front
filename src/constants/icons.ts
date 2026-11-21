import {
  ArrowLeftRight,
  Briefcase,
  Building2,
  Crown,
  FileSignature,
  FolderKanban,
  GraduationCap,
  Handshake,
  Hourglass,
  Laptop,
  Layers,
  Rocket,
  Sprout,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { ContractType, ExperienceLevel, WorkModel } from "@/types/job";

/** Um ícone por conceito, em um só lugar: o mesmo significado tem sempre o mesmo desenho. */

export const CONTRACT_ICONS: Record<ContractType, LucideIcon> = {
  clt: FileSignature,
  pj: Handshake,
  freelance: Zap,
  internship: GraduationCap,
  temporary: Hourglass,
};

export const WORK_MODEL_ICONS: Record<WorkModel, LucideIcon> = {
  remote: Laptop,
  hybrid: ArrowLeftRight,
  onsite: Building2,
};

export const EXPERIENCE_ICONS: Record<ExperienceLevel, LucideIcon> = {
  junior: Sprout,
  mid: Rocket,
  senior: Crown,
  any: Layers,
};

export const STAT_ICONS = {
  devs: Terminal,
  companies: Building2,
  jobs: Briefcase,
  projects: FolderKanban,
} as const satisfies Record<string, LucideIcon>;

export const ACTIVITY_ICONS = {
  job: { icon: Briefcase, className: "border-flag-green/40 bg-flag-green/10 text-flag-green" },
  project: { icon: FolderKanban, className: "border-flag-blue/45 bg-flag-blue/10 text-blue-300" },
  company: { icon: Building2, className: "border-brand-purple/45 bg-brand-purple/10 text-purple-300" },
} as const satisfies Record<string, { icon: LucideIcon; className: string }>;