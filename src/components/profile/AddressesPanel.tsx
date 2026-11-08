import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormMessage } from "@/components/layout/AuthShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { ErrorState, Spinner } from "@/components/ui/States";
import { STATE_NAMES } from "@/constants/profileOptions";
import { useAddressMutations, useAddresses } from "@/hooks/useProfile";
import type { Address, AddressOwner } from "@/types/profile";
import { getErrorMessage } from "@/utils/errors";
import { formatCep } from "@/utils/format";

import { FormActions } from "./FormActions";

const schema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().trim().min(1, "Informe o logradouro"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim(),
  neighborhood: z.string().trim().min(1, "Informe o bairro"),
  city: z.string().trim().min(1, "Informe a cidade"),
  state: z.string().length(2, "Escolha o estado"),
  country: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = { cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", country: "Brasil" };

function AddressForm({ owner, address, onClose }: { owner: AddressOwner; address: Address | null; onClose: () => void }) {
  const { create, update } = useAddressMutations(owner);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: address
      ? { cep: address.cep, street: address.street, number: address.number, complement: address.complement, neighborhood: address.neighborhood, city: address.city, state: address.state, country: address.country }
      : EMPTY,
  });
  const cepField = register("cep");

  // Preenche logradouro/bairro/cidade/UF pelo CEP (ViaCEP). Se falhar, o usuário digita à mão.
  const fillFromCep = async () => {
    const digits = getValues("cep").replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLookup(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (data.erro) return;
      if (data.logradouro) setValue("street", data.logradouro, { shouldValidate: true });
      if (data.bairro) setValue("neighborhood", data.bairro, { shouldValidate: true });
      if (data.localidade) setValue("city", data.localidade, { shouldValidate: true });
      if (data.uf) setValue("state", data.uf, { shouldValidate: true });
    } catch {
      /* sem conexão com o ViaCEP: segue manual */
    } finally {
      setLookup(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      if (address) await update.mutateAsync({ id: address.address_id, data: values });
      else await create.mutateAsync(values);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível salvar o endereço."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-6" noValidate>
      {error && (
        <div className="sm:col-span-6">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}
      <Field label="CEP" error={errors.cep?.message} hint={lookup ? "Buscando endereço..." : undefined} className="sm:col-span-2">
        <Input
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          {...cepField}
          onChange={(e) => { e.target.value = formatCep(e.target.value); void cepField.onChange(e); }}
          onBlur={(e) => { void cepField.onBlur(e); void fillFromCep(); }}
        />
      </Field>
      <Field label="Logradouro" error={errors.street?.message} className="sm:col-span-4">
        <Input autoComplete="address-line1" {...register("street")} />
      </Field>
      <Field label="Número" error={errors.number?.message} className="sm:col-span-2">
        <Input {...register("number")} />
      </Field>
      <Field label="Complemento" error={errors.complement?.message} className="sm:col-span-4">
        <Input placeholder="Sala, bloco, referência..." {...register("complement")} />
      </Field>
      <Field label="Bairro" error={errors.neighborhood?.message} className="sm:col-span-3">
        <Input {...register("neighborhood")} />
      </Field>
      <Field label="Cidade" error={errors.city?.message} className="sm:col-span-3">
        <Input autoComplete="address-level2" {...register("city")} />
      </Field>
      <Field label="Estado" error={errors.state?.message} className="sm:col-span-3">
        <Select {...register("state")}>
          <option value="">Selecione</option>
          {Object.entries(STATE_NAMES).map(([code, name]) => (
            <option key={code} value={code}>
              {name} ({code})
            </option>
          ))}
        </Select>
      </Field>
      <Field label="País" error={errors.country?.message} className="sm:col-span-3">
        <Input {...register("country")} />
      </Field>
      <div className="sm:col-span-6">
        <FormActions onCancel={onClose} loading={create.isPending || update.isPending} />
      </div>
    </form>
  );
}

export function AddressesPanel({ owner }: { owner: AddressOwner }) {
  const { data, isLoading, isError, error, refetch } = useAddresses(owner);
  const { remove, setPreferential } = useAddressMutations(owner);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    setActionError(null);
    try {
      await remove.mutateAsync(deleting.address_id);
      setDeleting(null);
    } catch (err) {
      setDeleting(null);
      setActionError(getErrorMessage(err, "Não foi possível excluir o endereço."));
    }
  };

  const makePreferential = async (id: string) => {
    setActionError(null);
    try {
      await setPreferential.mutateAsync(id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Endereços</h2>
          <p className="mt-1 text-sm text-slate-500">
            {owner === "company" ? "Sede e filiais. A cidade do endereço preferencial aparece no perfil da empresa." : "Seus endereços. Não aparecem no perfil público."}
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Novo endereço
        </Button>
      </div>

      {actionError && (
        <div className="mt-4">
          <FormMessage tone="error">{actionError}</FormMessage>
        </div>
      )}
      {isLoading && <Spinner />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
      {data && data.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">Nenhum endereço cadastrado ainda.</p>}
      {data && data.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.map((address) => (
            <article key={address.address_id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <MapPin className="size-5 shrink-0 text-flag-green" />
                {address.is_preferential && <Badge tone="green">Preferencial</Badge>}
              </div>
              <p className="mt-3 font-medium text-white">
                {address.street}, {address.number}
                {address.complement && ` — ${address.complement}`}
              </p>
              <p className="text-sm text-slate-400">{address.neighborhood}</p>
              <p className="text-sm text-slate-400">
                {address.city} - {address.state} · CEP {address.cep}
              </p>
              <div className="mt-4 flex flex-wrap gap-1 border-t border-white/10 pt-3 text-xs">
                {!address.is_preferential && (
                  <button onClick={() => void makePreferential(address.address_id)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-400 hover:bg-white/5 hover:text-flag-yellow">
                    <Star className="size-3.5" /> Tornar preferencial
                  </button>
                )}
                <button onClick={() => setEditing(address)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button onClick={() => setDeleting(address)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-slate-400 hover:bg-white/5 hover:text-red-400">
                  <Trash2 className="size-3.5" /> Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== "new" ? "Editar endereço" : "Novo endereço"} wide>
        {editing !== null && <AddressForm owner={owner} address={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir endereço"
        message="Esse endereço será removido definitivamente. Se for o preferencial e houver outros, defina outro como preferencial antes."
        loading={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleting(null)}
      />
    </Panel>
  );
}