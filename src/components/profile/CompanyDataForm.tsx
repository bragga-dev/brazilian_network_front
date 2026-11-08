import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { useIdentityMutation } from "@/hooks/useProfile";
import { accountService } from "@/services/account.service";
import type { CompanyProfile } from "@/types/auth";
import { getErrorMessage } from "@/utils/errors";
import { buildPatch } from "@/utils/form";

const link = z.string().trim().refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Use um link começando com http:// ou https://");

const schema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome da empresa"),
  legal_name: z.string().trim().max(255),
  cnpj: z.string().trim().refine((v) => !v || v.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos"),
  whatsapp: z.string().trim(),
  bio: z.string(),
  website: link,
  linkedin_url: link,
  github_url: link,
});
type FormValues = z.infer<typeof schema>;

const toDefaults = (company: CompanyProfile): FormValues => ({
  full_name: company.full_name ?? "",
  legal_name: company.legal_name ?? "",
  cnpj: company.cnpj ?? "",
  whatsapp: company.whatsapp ?? "",
  bio: company.bio ?? "",
  website: company.website ?? "",
  linkedin_url: company.linkedin_url ?? "",
  github_url: company.github_url ?? "",
});

export function CompanyDataForm({ company }: { company: CompanyProfile }) {
  const save = useIdentityMutation(accountService.updateCompany);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toDefaults(company) });

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    const patch = buildPatch(values, dirtyFields, ["full_name", "cnpj"]);
    if (Object.keys(patch).length === 0) return setMessage({ tone: "success", text: "Nada novo para salvar." });
    try {
      await save.mutateAsync(patch);
      reset(values);
      setMessage({ tone: "success", text: "Perfil da empresa atualizado." });
    } catch (err) {
      setMessage({ tone: "error", text: getErrorMessage(err, "Não foi possível salvar o perfil.") });
    }
  };

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Dados da empresa</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
        {message && (
          <div className="sm:col-span-2">
            <FormMessage tone={message.tone}>{message.text}</FormMessage>
          </div>
        )}
        <Field label="Nome fantasia" error={errors.full_name?.message}>
          <Input {...register("full_name")} />
        </Field>
        <Field label="Razão social" error={errors.legal_name?.message}>
          <Input {...register("legal_name")} />
        </Field>
        <Field label="CNPJ" error={errors.cnpj?.message} hint="Com ou sem máscara.">
          <Input inputMode="numeric" placeholder="00.000.000/0000-00" {...register("cnpj")} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message} hint="Com DDD.">
          <Input type="tel" inputMode="tel" {...register("whatsapp")} />
        </Field>
        <Field label="Sobre a empresa" error={errors.bio?.message} className="sm:col-span-2">
          <Textarea rows={5} placeholder="O que a empresa faz, cultura, tecnologias e o que busca em quem entra." {...register("bio")} />
        </Field>
        <Field label="Site" error={errors.website?.message}>
          <Input type="url" placeholder="https://empresa.com.br" {...register("website")} />
        </Field>
        <Field label="LinkedIn" error={errors.linkedin_url?.message}>
          <Input type="url" placeholder="https://linkedin.com/company/empresa" {...register("linkedin_url")} />
        </Field>
        <Field label="GitHub" error={errors.github_url?.message} className="sm:col-span-2">
          <Input type="url" placeholder="https://github.com/empresa" {...register("github_url")} />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" size="sm" disabled={!isDirty} onClick={() => reset(toDefaults(company))}>
            Desfazer
          </Button>
          <Button type="submit" size="sm" loading={save.isPending} disabled={!isDirty}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Panel>
  );
}