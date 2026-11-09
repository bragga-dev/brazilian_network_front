import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { COURSE_TYPE_OPTIONS, PROGRESS_STATUS_OPTIONS } from "@/constants/profileOptions";
import { useProfileMutation } from "@/hooks/useProfile";
import { profileService } from "@/services/profile.service";
import type { Course, CourseInput } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";
import { emptyToUndefined } from "@/utils/form";

import { FormActions } from "./FormActions";
import { CourseCard } from "./ProfileItems";
import { ItemActions, SectionPanel } from "./SectionPanel";

const link = z.string().trim().max(500).refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Use um link começando com http:// ou https://");

const schema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome do curso"),
    provider: z.string().trim().min(2, "Informe a instituição/plataforma"),
    course_type: z.enum(COURSE_TYPE_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    status: z.enum(PROGRESS_STATUS_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    workload: z.string().refine((v) => !v || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 10000), "Entre 1 e 10000 horas"),
    start_date: z.string(),
    completion_date: z.string(),
    course_url: link,
    certificate_url: link,
    description: z.string().max(5000),
  })
  .refine((v) => !v.start_date || !v.completion_date || v.completion_date >= v.start_date, {
    path: ["completion_date"],
    message: "A conclusão não pode ser anterior ao início",
  });
type FormValues = z.infer<typeof schema>;

function CourseForm({ item, onClose }: { item: Course | null; onClose: () => void }) {
  const create = useProfileMutation(profileService.courses.create);
  const update = useProfileMutation(profileService.courses.update);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? "",
      provider: item?.provider ?? "",
      course_type: item?.course_type ?? "free_course",
      status: item?.status ?? "completed",
      workload: item?.workload ? String(item.workload) : "",
      start_date: item?.start_date ?? "",
      completion_date: item?.completion_date ?? "",
      course_url: item?.course_url ?? "",
      certificate_url: item?.certificate_url ?? "",
      description: item?.description ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const data = {
      ...values,
      workload: values.workload ? Number(values.workload) : undefined,
      start_date: emptyToUndefined(values.start_date),
      completion_date: emptyToUndefined(values.completion_date),
    } as CourseInput;
    try {
      if (item) await update.mutateAsync({ id: item.course_id, data });
      else await create.mutateAsync(data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível salvar o curso."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      {error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="Nome do curso" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field label="Instituição / plataforma" error={errors.provider?.message}>
        <Input placeholder="Alura, Udemy, Rocketseat..." {...register("provider")} />
      </Field>
      <Field label="Tipo" error={errors.course_type?.message}>
        <Select {...register("course_type")}>
          {COURSE_TYPE_OPTIONS.map((o) => (
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
      <Field label="Conclusão" error={errors.completion_date?.message}>
        <Input type="date" {...register("completion_date")} />
      </Field>
      <Field label="Carga horária (horas)" error={errors.workload?.message}>
        <Input inputMode="numeric" {...register("workload")} />
      </Field>
      <Field label="Link do curso" error={errors.course_url?.message}>
        <Input type="url" placeholder="https://..." {...register("course_url")} />
      </Field>
      <Field label="Link do certificado" error={errors.certificate_url?.message} className="sm:col-span-2">
        <Input type="url" placeholder="https://..." {...register("certificate_url")} />
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

export function CoursesPanel({ items }: { items: Course[] }) {
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const update = useProfileMutation(profileService.courses.update);
  const remove = useProfileMutation(profileService.courses.remove);

  return (
    <>
      <SectionPanel
      title="Cursos complementares"
      hint="Bootcamps, certificações, workshops e capacitações."
      addLabel="Adicionar curso"
      onAdd={() => setEditing("new")}
      empty={items.length === 0 ? "Nenhum curso cadastrado." : undefined}
    >
      {items.map((item) => (
        <CourseCard
          key={item.course_id}
          item={item}
          actions={
            <ItemActions
              active={item.is_active}
              onToggle={() => update.mutate({ id: item.course_id, data: { is_active: !item.is_active } })}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
            />
          }
        />
      ))}
      </SectionPanel>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? "Editar curso" : "Novo curso"} wide>
        {editing !== null && <CourseForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir curso"
        message={`Remover "${deleting?.name}" do seu perfil?`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.course_id, { onSuccess: () => setDeleting(null) })}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}