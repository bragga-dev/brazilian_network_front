import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EDUCATION_LEVEL_OPTIONS, PROGRESS_STATUS_OPTIONS } from "@/constants/profileOptions";
import { useProfileMutation } from "@/hooks/useProfile";
import { profileService } from "@/services/profile.service";
import type { Education, EducationInput } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";
import { emptyToUndefined } from "@/utils/form";

import { FormActions } from "./FormActions";
import { EducationCard } from "./ProfileItems";
import { ItemActions, SectionPanel } from "./SectionPanel";

const schema = z
  .object({
    institution: z.string().trim().min(2, "Informe a instituição"),
    course: z.string().trim().min(2, "Informe o curso"),
    education_level: z.enum(EDUCATION_LEVEL_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    status: z.enum(PROGRESS_STATUS_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    start_date: z.string().min(1, "Informe a data de início"),
    end_date: z.string(),
    description: z.string().max(5000, "Máximo de 5000 caracteres"),
  })
  .refine((v) => !v.end_date || v.end_date >= v.start_date, { path: ["end_date"], message: "A data final não pode ser anterior à inicial" });
type FormValues = z.infer<typeof schema>;

function EducationForm({ item, onClose }: { item: Education | null; onClose: () => void }) {
  const create = useProfileMutation(profileService.educations.create);
  const update = useProfileMutation(profileService.educations.update);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      institution: item?.institution ?? "",
      course: item?.course ?? "",
      education_level: item?.education_level ?? "undergraduate",
      status: item?.status ?? "in_progress",
      start_date: item?.start_date ?? "",
      end_date: item?.end_date ?? "",
      description: item?.description ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const data = { ...values, end_date: emptyToUndefined(values.end_date) } as EducationInput;
    try {
      if (item) await update.mutateAsync({ id: item.education_id, data });
      else await create.mutateAsync(data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível salvar a formação."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      {error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="Instituição" error={errors.institution?.message}>
        <Input {...register("institution")} />
      </Field>
      <Field label="Curso" error={errors.course?.message}>
        <Input {...register("course")} />
      </Field>
      <Field label="Nível de escolaridade" error={errors.education_level?.message}>
        <Select {...register("education_level")}>
          {EDUCATION_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Situação" error={errors.status?.message}>
        <Select {...register("status")}>
          {PROGRESS_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Início" error={errors.start_date?.message}>
        <Input type="date" {...register("start_date")} />
      </Field>
      <Field label="Término" error={errors.end_date?.message} hint="Deixe vazio se ainda estiver cursando.">
        <Input type="date" {...register("end_date")} />
      </Field>
      <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
        <Textarea rows={3} {...register("description")} />
      </Field>
      <div className="sm:col-span-2">
        <FormActions onCancel={onClose} loading={create.isPending || update.isPending} />
      </div>
    </form>
  );
}

export function EducationPanel({ items }: { items: Education[] }) {
  const [editing, setEditing] = useState<Education | "new" | null>(null);
  const [deleting, setDeleting] = useState<Education | null>(null);
  const update = useProfileMutation(profileService.educations.update);
  const remove = useProfileMutation(profileService.educations.remove);

  return (
    <SectionPanel
      title="Formação acadêmica"
      hint="Escolaridade e cursos de graduação, técnico, pós e afins."
      addLabel="Adicionar formação"
      onAdd={() => setEditing("new")}
      empty={items.length === 0 ? "Nenhuma formação cadastrada." : undefined}
    >
      {items.map((item) => (
        <EducationCard
          key={item.education_id}
          item={item}
          actions={
            <ItemActions
              active={item.is_active}
              onToggle={() => update.mutate({ id: item.education_id, data: { is_active: !item.is_active } })}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
            />
          }
        />
      ))}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? "Editar formação" : "Nova formação"} wide>
        {editing !== null && <EducationForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir formação"
        message={`Remover "${deleting?.course}" do seu perfil?`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.education_id, { onSuccess: () => setDeleting(null) })}
        onClose={() => setDeleting(null)}
      />
    </SectionPanel>
  );
}