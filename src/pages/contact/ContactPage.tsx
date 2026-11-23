import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Panel, SectionLabel } from "@/components/ui/Panel";
import { useAuth } from "@/hooks/useAuth";
import { contactService } from "@/services/contact.service";
import { getErrorMessage } from "@/utils/errors";

const schema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().min(8, "Informe um telefone com DDD"),
  subject: z.string().trim().min(3, "Informe o assunto"),
  message: z.string().trim().min(10, "Escreva pelo menos 10 caracteres"),
});
type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const { me } = useAuth();
  const profileName = me?.dev ? [me.dev.first_name, me.dev.last_name].filter(Boolean).join(" ") : (me?.company?.full_name ?? "");
  const send = useMutation({ mutationFn: contactService.send });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { full_name: profileName, email: me?.user.email ?? "", phone: "", subject: "", message: "" },
  });

  const onSubmit = (values: FormValues) => send.mutate(values, { onSuccess: () => reset({ ...values, subject: "", message: "" }) });

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-12 sm:px-6">
      <SectionLabel>Contato</SectionLabel>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Fale com a gente</h1>
      <p className="mt-2 text-slate-400">Dúvidas, sugestões ou parcerias: envie sua mensagem e respondemos por e-mail.</p>

      <Panel className="mt-8 p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          {send.isSuccess && (
            <div className="sm:col-span-2">
              <FormMessage tone="success">Mensagem enviada! Retornaremos em breve.</FormMessage>
            </div>
          )}
          {send.isError && (
            <div className="sm:col-span-2">
              <FormMessage tone="error">{getErrorMessage(send.error, "Não foi possível enviar sua mensagem.")}</FormMessage>
            </div>
          )}
          <Field label="Nome completo" error={errors.full_name?.message}>
            <Input autoComplete="name" {...register("full_name")} />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="Telefone" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" placeholder="(71) 90000-0000" {...register("phone")} />
          </Field>
          <Field label="Assunto" error={errors.subject?.message}>
            <Input {...register("subject")} />
          </Field>
          <Field label="Mensagem" error={errors.message?.message} className="sm:col-span-2">
            <Textarea rows={6} {...register("message")} />
          </Field>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" loading={send.isPending}>
              Enviar mensagem
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}