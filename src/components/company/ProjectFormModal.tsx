import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AreaPicker } from "@/components/company/AreaPicker";
import { TechnologyPicker } from "@/components/company/TechnologyPicker";
import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EXPERIENCE_OPTIONS } from "@/constants/jobOptions";
import { useListingMutations } from "@/hooks/useManage";
import type { JobTechnology } from "@/types/job";
import type { ManagedProject, ProjectInput } from "@/types/manage";
import { getErrorMessage } from "@/utils/errors";
import { moneyToApi, moneyToForm, optionalMoney } from "@/utils/money";

const schema = z
  .object({
    title: z.string().trim().min(2, "Informe o título").max(150, "Máximo de 150 caracteres"),
    description: z.string().trim().min(1, "Descreva o projeto").max(10000, "Máximo de 10000 caracteres"),
    requirements: z.string().trim().max(10000, "Máximo de 10000 caracteres"),
    experience_level: z.enum(["any", "junior", "mid", "senior"]),
    min_value: optionalMoney,
    max_value: optionalMoney,
    value_visible: z.boolean(),
    estimated_duration_days: z.string().trim().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 3650, "Informe de 1 a 3650 dias"),
  })
  .superRefine((v, ctx) => {
    const min = v.min_value ? Number(v.min_value.replace(",", ".")) : null;
    const max = v.max_value ? Number(v.max_value.replace(",", ".")) : null;
    if (min !== null && max !== null && max < min) ctx.addIssue({ code: "custom", path: ["max_value"], message: "O valor máximo não pode ser menor que o mínimo" });
  });
type FormValues = z.infer<typeof schema>;

const techKey = (items: JobTechnology[]) => items.map((i) => `${i.technology.technology_id}:${i.is_required}`).sort().join(",");

function Form({ project, onClose }: { project?: ManagedProject; onClose: () => void }) {
  const { create, update, setTechnologies, setAreas } = useListingMutations("project");
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [technologies, setTechs] = useState<JobTechnology[]>(project?.technologies ?? []);
  const [areaIds, setAreaIds] = useState<string[]>(project?.areas.map((a) => a.work_area_id) ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      requirements: project?.requirements ?? "",
      experience_level: project?.experience_level ?? "any",
      min_value: moneyToForm(project?.min_value),
      max_value: moneyToForm(project?.max_value),
      value_visible: project?.value_visible ?? true,
      estimated_duration_days: project ? String(project.estimated_duration_days) : "",
    },
  });
  const pending = create.isPending || update.isPending || setTechnologies.isPending || setAreas.isPending;

  const onSubmit = async (v: FormValues) => {
    setError(null);
    const body: ProjectInput = {
      title: v.title,
      description: v.description,
      requirements: v.requirements,
      experience_level: v.experience_level,
      min_value: moneyToApi(v.min_value),
      max_value: moneyToApi(v.max_value),
      value_visible: v.value_visible,
      estimated_duration_days: Number(v.estimated_duration_days),
    };

    try {
      let id = project?.project_id ?? savedId;
      if (!id) {
        const created = (await create.mutateAsync(body as never)) as ManagedProject;
        id = created.project_id;
        setSavedId(id);
      } else if (project) {
        await update.mutateAsync({ id, data: body as never });
      }
      if (!project || techKey(technologies) !== techKey(project.technologies)) {
        await setTechnologies.mutateAsync({ id, items: technologies.map((t) => ({ technology_id: t.technology.technology_id, is_required: t.is_required })) });
      }
      if (!project || areaIds.slice().sort().join() !== project.areas.map((a) => a.work_area_id).sort().join()) {
        await setAreas.mutateAsync({ id, areaIds });
      }
      onClose();
    } catch (err) {
      const prefix = savedId || project ? "O projeto foi salvo, mas não foi possível concluir: " : "";
      setError(prefix + getErrorMessage(err, "Não foi possível salvar o projeto."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      {error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
        <Input {...register("title")} />
      </Field>
      <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
        <Textarea rows={5} {...register("description")} />
      </Field>
      <Field label="Requisitos (opcional)" error={errors.requirements?.message} className="sm:col-span-2">
        <Textarea rows={3} {...register("requirements")} />
      </Field>
      <Field label="Nível" error={errors.experience_level?.message}>
        <Select {...register("experience_level")}>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Duração estimada (dias)" error={errors.estimated_duration_days?.message}>
        <Input type="number" min={1} max={3650} {...register("estimated_duration_days")} />
      </Field>
      <Field label="Valor mínimo (R$)" error={errors.min_value?.message}>
        <Input inputMode="decimal" placeholder="1500" {...register("min_value")} />
      </Field>
      <Field label="Valor máximo (R$)" error={errors.max_value?.message}>
        <Input inputMode="decimal" placeholder="3000" {...register("max_value")} />
      </Field>
      <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
        <input type="checkbox" className="size-4 accent-flag-green" {...register("value_visible")} />
        Mostrar o valor no projeto
      </label>

      <div className="sm:col-span-2">
        <TechnologyPicker value={technologies} onChange={setTechs} />
      </div>
      <div className="sm:col-span-2">
        <AreaPicker value={areaIds} onChange={setAreaIds} />
      </div>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={pending}>
          {project ? "Salvar alterações" : "Criar rascunho"}
        </Button>
      </div>
    </form>
  );
}

export function ProjectFormModal({ open, onClose, project }: { open: boolean; onClose: () => void; project?: ManagedProject }) {
  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar projeto" : "Novo projeto"} wide>
      <Form project={project} onClose={onClose} />
    </Modal>
  );
}