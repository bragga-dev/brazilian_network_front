import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useJobApplicationMutations } from "@/hooks/useApplications";
import type { JobApplication } from "@/types/application";
import { getErrorMessage } from "@/utils/errors";

const schema = z.object({ cover_letter: z.string().trim().max(5000, "Máximo de 5000 caracteres") });
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Criação: informe a vaga. Edição: informe a candidatura (só pendentes são editáveis). */
  job?: { job_id: string; title: string };
  application?: JobApplication;
}

function Form({ job, application, onClose }: Omit<Props, "open">) {
  const { create, update } = useJobApplicationMutations();
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(application);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { cover_letter: application?.cover_letter ?? "" } });

  const pending = create.isPending || update.isPending;

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      if (application) await update.mutateAsync({ id: application.send_job_application_id, data: { cover_letter: values.cover_letter } });
      else if (job) await create.mutateAsync({ job_id: job.job_id, cover_letter: values.cover_letter });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível enviar a candidatura."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-sm text-slate-400">
        {editing ? "Edite a mensagem enviada para" : "Você vai se candidatar a"} <span className="font-medium text-white">{application?.job_title ?? job?.title}</span>. A empresa recebe seu perfil e seu currículo.
      </p>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <Field label="Mensagem de apresentação (opcional)" error={errors.cover_letter?.message} hint="Conte por que você se encaixa na vaga. Até 5000 caracteres.">
        <Textarea rows={7} {...register("cover_letter")} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={pending} disabled={editing && !isDirty}>
          {editing ? "Salvar alterações" : "Enviar candidatura"}
        </Button>
      </div>
    </form>
  );
}

export function ApplyJobModal({ open, onClose, job, application }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={application ? "Editar candidatura" : "Candidatar-se à vaga"} wide>
      <Form job={job} application={application} onClose={onClose} />
    </Modal>
  );
}