import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useAdminCampaignMutations } from "@/hooks/useAdmin";
import type { AdminCampaign } from "@/types/admin";
import { getErrorMessage } from "@/utils/errors";

/** ISO (UTC) -> valor de <input type="datetime-local"> no fuso do navegador. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const toIso = (local: string): string | null => (local ? new Date(local).toISOString() : null);

interface Props {
  open: boolean;
  campaign?: AdminCampaign | null;
  onClose: () => void;
}

export function CampaignFormModal({ open, campaign, onClose }: Props) {
  // O pai monta o modal com `key` por campanha, então o estado inicial já vem certo.
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [startsAt, setStartsAt] = useState(toLocalInput(campaign?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(campaign?.ends_at ?? null));
  const [error, setError] = useState<string | null>(null);
  const { create, update } = useAdminCampaignMutations();
  const busy = create.isPending || update.isPending;

  const submit = () => {
    setError(null);
    if (title.trim().length < 2) return setError("Informe o título da campanha.");
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return setError("O término deve ser depois do início.");

    const data = { title: title.trim(), description: description.trim() || null, starts_at: toIso(startsAt), ends_at: toIso(endsAt) };
    const options = { onSuccess: onClose, onError: (err: unknown) => setError(getErrorMessage(err, "Não foi possível salvar a campanha.")) };
    if (campaign) update.mutate({ id: campaign.campaign_id, data }, options);
    else create.mutate(data, options);
  };

  return (
    <Modal open={open} onClose={onClose} title={campaign ? "Editar campanha" : "Nova campanha"}>
      <div className="space-y-4">
        <Field label="Título">
          <Input value={title} maxLength={150} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Descrição (opcional)">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Início (opcional)" hint="Vazio = vale desde já.">
            <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </Field>
          <Field label="Término (opcional)" hint="Vazio = sem data de fim.">
            <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          </Field>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" loading={busy} onClick={submit}>
            {campaign ? "Salvar" : "Criar campanha"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}