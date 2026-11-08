import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/constants/profileOptions";
import { useProfileMutation } from "@/hooks/useProfile";
import { profileService } from "@/services/profile.service";
import type { Experience, ExperienceInput } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";

import { FormActions } from "./FormActions";
import { ExperienceCard } from "./ProfileItems";
import { ItemActions, SectionPanel } from "./SectionPanel";

const schema = z
  .object({
    company: z.string().trim().min(2, "Informe a empresa"),
    position: z.string().trim().min(2, "Informe o cargo"),
    employment_type: z.enum(EMPLOYMENT_TYPE_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    is_current: z.boolean(),
    start_date: z.string().min(1, "Informe a data de início"),
    end_date: z.string(),
    description: z.string().max(5000, "Máximo de 5000 caracteres"),
  })
  .superRefine((v, ctx) => {
    if (!v.is_current && !v.end_date) ctx.addIssue({ code: "custom", path: ["end_date"], message: "Informe o término ou marque como emprego atual" });
    if (v.end_date && v.end_date < v.start_date) ctx.addIssue({ code: "custom", path: ["end_date"], message: "A data final não pode ser anterior à inicial" });
  });
type FormValues = z.infer<typeof schema>;

function ExperienceForm({ item, onClose }: { item: Experience | null; onClose: () => void }) {
  const create = useProfileMutation(profileService.experiences.create);
  const update = useProfileMutation(profileService.experiences.update);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: item?.company ?? "",
      position: item?.position ?? "",
      employment_type: item?.employment_type ?? "clt",
      is_current: item?.is_current ?? false,
      start_date: item?.start_date ?? "",
      end_date: item?.end_date ?? "",
      description: item?.description ?? "",
    },
  });
  const isCurrent = watch("is_current");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const data = { ...values, end_date: values.is_current || !values.end_date ? undefined : values.end_date } as ExperienceInput;
    try {
      if (item) await update.mutateAsync({ id: item.experience_id, data });
      else await create.mutateAsync(data);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível salvar a experiência."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      {error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="Cargo" error={errors.position?.message}>
        <Input {...register("position")} />
      </Field>
      <Field label="Empresa" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field label="Tipo de vínculo" error={errors.employment_type?.message} className="sm:col-span-2">
        <Select {...register("employment_type")}>
          {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Início" error={errors.start_date?.message}>
        <Input type="date" {...register("start_date")} />
      </Field>
      <Field label="Término" error={errors.end_date?.message}>
        <Input type="date" disabled={isCurrent} {...register("end_date")} />
      </Field>
      <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
        <input type="checkbox" className="size-4 accent-flag-green" {...register("is_current")} />
        Trabalho aqui atualmente
      </label>
      <Field label="Atividades e conquistas" error={errors.description?.message} className="sm:col-span-2">
        <Textarea rows={4} {...register("description")} />
      </Field>
      <div className="sm:col-span-2">
        <FormActions onCancel={onClose} loading={create.isPending || update.isPending} />
      </div>
    </form>
  );
}

export function ExperiencePanel({ items }: { items: Experience[] }) {
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [deleting, setDeleting] = useState<Experience | null>(null);
  const update = useProfileMutation(profileService.experiences.update);
  const remove = useProfileMutation(profileService.experiences.remove);

  return (
    <SectionPanel
      title="Experiência profissional"
      hint="Empregos, estágios, freelas e trabalhos voluntários."
      addLabel="Adicionar experiência"
      onAdd={() => setEditing("new")}
      empty={items.length === 0 ? "Nenhuma experiência cadastrada." : undefined}
    >
      {items.map((item) => (
        <ExperienceCard
          key={item.experience_id}
          item={item}
          actions={
            <ItemActions
              active={item.is_active}
              onToggle={() => update.mutate({ id: item.experience_id, data: { is_active: !item.is_active } })}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
            />
          }
        />
      ))}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? "Editar experiência" : "Nova experiência"} wide>
        {editing !== null && <ExperienceForm item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir experiência"
        message={`Remover "${deleting?.position}" da ${deleting?.company} do seu perfil?`}
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.experience_id, { onSuccess: () => setDeleting(null) })}
        onClose={() => setDeleting(null)}
      />
    </SectionPanel>
  );
}