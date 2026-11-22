import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useProjectApplicationMutations } from "@/hooks/useApplications";
import type { ProjectApplication, ProjectApplicationUpdate } from "@/types/application";
import { getErrorMessage } from "@/utils/errors";

const MAX_VALUE = 99_999_999.99; // Decimal(10, 2) do backend

const schema = z.object({
  proposed_value: z
    .string()
    .trim()
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= MAX_VALUE, "Informe um valor válido, com até 2 casas decimais (ex.: 1500.00)"),
  proposed_duration_days: z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 3650, "Informe de 1 a 3650 dias"),
  cover_letter: z.string().trim().max(5000, "Máximo de 5000 caracteres"),
  description: z.string().trim().max(1000, "Máximo de 1000 caracteres"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Criação: informe o projeto. Edição: informe a proposta (só pendentes são editáveis). */
  project?: { project_id: string; title: string };
  application?: ProjectApplication;
}

function Form({ project, application, onClose }: Omit<Props, "open">) {
  const { create, update } = useProjectApplicationMutations();
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(application);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      proposed_value: application ? String(Number(application.proposed_value)) : "",
      proposed_duration_days: application ? String(application.proposed_duration_days) : "",
      cover_letter: application?.cover_letter ?? "",
      description: application?.description ?? "",
    },
  });

  const pending = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      if (application) {
        const patch: ProjectApplicationUpdate = {};
        if (dirtyFields.cover_letter) patch.cover_letter = values.cover_letter;
        if (dirtyFields.proposed_value) patch.proposed_value = Number(values.proposed_value).toFixed(2);
        if (dirtyFields.proposed_duration_days) patch.proposed_duration_days = Number(values.proposed_duration_days);
        if (dirtyFields.description) patch.description = values.description || null;
        await update.mutateAsync({ id: application.send_project_application_id, data: patch });
      } else if (project) {
        await create.mutateAsync({
          project_id: project.project_id,
          cover_letter: values.cover_letter,
          proposed_value: Number(values.proposed_value).toFixed(2),
          proposed_duration_days: Number(values.proposed_duration_days),
          description: values.description || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível enviar a proposta."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <p className="text-sm text-slate-400 sm:col-span-2">
        {editing ? "Edite sua proposta para" : "Envie sua proposta para"} <span className="font-medium text-white">{application?.project_title ?? project?.title}</span>. A empresa recebe seu perfil e seu currículo.
      </p>
      {error && (
        <div className="sm:col-span-2">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="Valor proposto (R$)" error={errors.proposed_value?.message}>
        <Input type="number" inputMode="decimal" min={0} step="0.01" placeholder="1500.00" {...register("proposed_value")} />
      </Field>
      <Field label="Prazo proposto (dias)" error={errors.proposed_duration_days?.message}>
        <Input type="number" inputMode="numeric" min={1} max={3650} step={1} placeholder="30" {...register("proposed_duration_days")} />
      </Field>
      <Field label="Mensagem de apresentação (opcional)" error={errors.cover_letter?.message} className="sm:col-span-2">
        <Textarea rows={4} {...register("cover_letter")} />
      </Field>
      <Field label="Detalhes da proposta (opcional)" error={errors.description?.message} hint="Escopo, entregas, etapas. Até 1000 caracteres." className="sm:col-span-2">
        <Textarea rows={4} {...register("description")} />
      </Field>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={pending} disabled={editing && !isDirty}>
          {editing ? "Salvar alterações" : "Enviar proposta"}
        </Button>
      </div>
    </form>
  );
}

export function ApplyProjectModal({ open, onClose, project, application }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={application ? "Editar proposta" : "Enviar proposta"} wide>
      <Form project={project} application={application} onClose={onClose} />
    </Modal>
  );
}