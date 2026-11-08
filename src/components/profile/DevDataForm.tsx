import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { GENDER_OPTIONS } from "@/constants/profileOptions";
import { useIdentityMutation } from "@/hooks/useProfile";
import { accountService } from "@/services/account.service";
import type { MyDev } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";
import { buildPatch } from "@/utils/form";

const link = z.string().trim().refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Use um link começando com http:// ou https://");

const schema = z.object({
  first_name: z.string().trim().min(2, "Informe o nome"),
  last_name: z.string().trim().min(2, "Informe o sobrenome"),
  username: z.string().trim().min(2, "Mínimo de 2 caracteres").regex(/^[\w.@+-]+$/, "Use letras, números e . @ + - _"),
  headline: z.string().trim().max(255, "Máximo de 255 caracteres"),
  bio: z.string(),
  whatsapp: z.string().trim(),
  gender: z.enum(GENDER_OPTIONS),
  birth_date: z.string().refine((v) => !v || v <= new Date().toISOString().slice(0, 10), "A data não pode estar no futuro"),
  github_url: link,
  linkedin_url: link,
  site_url: link,
  accepts_patriot_discount: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const toDefaults = (dev: MyDev): FormValues => ({
  first_name: dev.first_name ?? "",
  last_name: dev.last_name ?? "",
  username: dev.username ?? "",
  headline: dev.headline ?? "",
  bio: dev.bio ?? "",
  whatsapp: dev.whatsapp ?? "",
  gender: dev.gender,
  birth_date: dev.birth_date ?? "",
  github_url: dev.github_url ?? "",
  linkedin_url: dev.linkedin_url ?? "",
  site_url: dev.site_url ?? "",
  accepts_patriot_discount: dev.accepts_patriot_discount,
});

export function DevDataForm({ dev }: { dev: MyDev }) {
  const save = useIdentityMutation(accountService.updateDev);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toDefaults(dev) });

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    const patch = buildPatch(values, dirtyFields, ["birth_date", "gender", "username"]);
    if (Object.keys(patch).length === 0) return setMessage({ tone: "success", text: "Nada novo para salvar." });
    try {
      await save.mutateAsync(patch);
      reset(values);
      setMessage({ tone: "success", text: "Perfil atualizado." });
    } catch (err) {
      setMessage({ tone: "error", text: getErrorMessage(err, "Não foi possível salvar o perfil.") });
    }
  };

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Dados pessoais</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
        {message && (
          <div className="sm:col-span-2">
            <FormMessage tone={message.tone}>{message.text}</FormMessage>
          </div>
        )}
        <Field label="Nome" error={errors.first_name?.message}>
          <Input autoComplete="given-name" {...register("first_name")} />
        </Field>
        <Field label="Sobrenome" error={errors.last_name?.message}>
          <Input autoComplete="family-name" {...register("last_name")} />
        </Field>
        <Field label="Nome de usuário" error={errors.username?.message}>
          <Input autoComplete="username" {...register("username")} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message} hint="Com DDD. Não aparece no perfil público.">
          <Input type="tel" inputMode="tel" placeholder="(73) 99999-9999" {...register("whatsapp")} />
        </Field>
        <Field label="Título profissional" error={errors.headline?.message} className="sm:col-span-2">
          <Input placeholder="Ex.: Desenvolvedor Full Stack | Python & Django" {...register("headline")} />
        </Field>
        <Field label="Sobre mim" error={errors.bio?.message} className="sm:col-span-2">
          <Textarea rows={5} placeholder="Conte um pouco sobre você, seu foco e o que busca." {...register("bio")} />
        </Field>
        <Field label="Gênero" error={errors.gender?.message}>
          <Select {...register("gender")}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data de nascimento" error={errors.birth_date?.message} hint="Não aparece no perfil público.">
          <Input type="date" max={new Date().toISOString().slice(0, 10)} {...register("birth_date")} />
        </Field>
        <Field label="GitHub" error={errors.github_url?.message}>
          <Input type="url" placeholder="https://github.com/usuario" {...register("github_url")} />
        </Field>
        <Field label="LinkedIn" error={errors.linkedin_url?.message}>
          <Input type="url" placeholder="https://linkedin.com/in/usuario" {...register("linkedin_url")} />
        </Field>
        <Field label="Site / portfólio" error={errors.site_url?.message} className="sm:col-span-2">
          <Input type="url" placeholder="https://meusite.dev" {...register("site_url")} />
        </Field>
        <label className="flex items-start gap-3 text-sm text-slate-300 sm:col-span-2">
          <input type="checkbox" className="mt-0.5 size-4 accent-flag-green" {...register("accepts_patriot_discount")} />
          <span>Aceito desconto patriota nas oportunidades que oferecerem.</span>
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" size="sm" disabled={!isDirty} onClick={() => reset(toDefaults(dev))}>
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