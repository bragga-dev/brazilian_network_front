import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useAdminCampaignMutations, useCampaignImages } from "@/hooks/useAdmin";
import type { AdminCampaign, CampaignImage } from "@/types/admin";
import { getErrorMessage } from "@/utils/errors";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

function ImageRow({ image, onDelete }: { image: CampaignImage; onDelete: () => void }) {
  const { updateImage, setCover } = useAdminCampaignMutations();
  const [order, setOrder] = useState(String(image.display_order));
  const [title, setTitle] = useState(image.title);
  const [subtitle, setSubtitle] = useState(image.subtitle);
  const [fit, setFit] = useState<"cover" | "contain">(image.fit === "contain" ? "contain" : "cover");
  const [error, setError] = useState<string | null>(null);

  const dirty = Number(order) !== image.display_order || title !== image.title || subtitle !== image.subtitle || fit !== image.fit;

  const save = () => {
    setError(null);
    const displayOrder = Number(order);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) return setError("A ordem deve ser um número inteiro (0 ou mais).");
    updateImage.mutate({ id: image.campaign_mage_id, data: { display_order: displayOrder, title, subtitle, fit } }, { onError: (err) => setError(getErrorMessage(err)) });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/30 p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-44">
        <img src={image.image_url} alt={image.title || "Banner"} className={`aspect-video w-full rounded-lg bg-black/50 ${fit === "contain" ? "object-contain" : "object-cover"}`} />
        <div className="mt-2 flex flex-wrap gap-1.5">{image.is_cover && <Badge tone="yellow">Capa</Badge>}</div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título do banner">
            <Input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Subtítulo">
            <Input value={subtitle} maxLength={200} onChange={(event) => setSubtitle(event.target.value)} />
          </Field>
          <Field label="Ordem" hint="Menor aparece primeiro.">
            <Input type="number" min={0} value={order} onChange={(event) => setOrder(event.target.value)} />
          </Field>
          <Field label="Ajuste da imagem">
            <Select value={fit} onChange={(event) => setFit(event.target.value as "cover" | "contain")}>
              <option value="cover">Preencher (corta as bordas)</option>
              <option value="contain">Mostrar inteira</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={!dirty} loading={updateImage.isPending} onClick={save}>
            Salvar
          </Button>
          {!image.is_cover && (
            <Button variant="purple" size="sm" loading={setCover.isPending} onClick={() => setCover.mutate(image.campaign_mage_id, { onError: (err) => setError(getErrorMessage(err)) })}>
              <Star className="size-4" aria-hidden /> Definir como capa
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden /> Excluir
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  campaign: AdminCampaign | null;
  onClose: () => void;
}

export function CampaignImagesModal({ campaign, onClose }: Props) {
  const campaignId = campaign?.campaign_id ?? null;
  const { data: images, isLoading } = useCampaignImages(campaignId);
  const { uploadImage, removeImage } = useAdminCampaignMutations();
  const input = useRef<HTMLInputElement>(null);
  const [isCover, setIsCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CampaignImage | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file || !campaignId) return;
    setError(null);
    if (!ALLOWED.includes(file.type)) return setError("Use uma imagem JPG, PNG ou WebP.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`A imagem deve ter até ${MAX_MB} MB.`);
    const nextOrder = images && images.length > 0 ? Math.max(...images.map((item) => item.display_order)) + 1 : 0;
    uploadImage.mutate(
      { campaignId, file, isCover: isCover || !images?.length, displayOrder: nextOrder },
      { onSuccess: () => setIsCover(false), onError: (err) => setError(getErrorMessage(err, "Não foi possível enviar a imagem.")) },
    );
    if (input.current) input.current.value = "";
  };

  return (
    <Modal open={Boolean(campaign)} onClose={onClose} title={`Banners · ${campaign?.title ?? ""}`}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/15 p-4">
          <input ref={input} type="file" accept={ALLOWED.join(",")} hidden onChange={(event) => onFile(event.target.files?.[0])} />
          <Button variant="secondary" size="sm" loading={uploadImage.isPending} onClick={() => input.current?.click()}>
            <ImagePlus className="size-4" aria-hidden /> Enviar banner
          </Button>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} className="accent-flag-green" />
            Usar como capa
          </label>
          <span className="text-xs text-slate-500">JPG, PNG ou WebP, até {MAX_MB} MB. A primeira imagem vira a capa.</span>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        {isLoading && <Spinner />}
        {images && images.length === 0 && <EmptyState title="Nenhum banner ainda">Envie a primeira imagem desta campanha.</EmptyState>}
        {images && images.length > 0 && (
          <div className="space-y-3">
            {[...images]
              .sort((a, b) => a.display_order - b.display_order)
              .map((image) => (
                // `key` inclui os valores do servidor: após salvar, o formulário da linha reinicia com o dado novo.
                <ImageRow key={`${image.campaign_mage_id}-${image.display_order}-${image.title}-${image.subtitle}-${image.fit}`} image={image} onDelete={() => setToDelete(image)} />
              ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir banner"
        message="A imagem será removida da campanha."
        loading={removeImage.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          removeImage.mutate(toDelete.campaign_mage_id, {
            onSuccess: () => setToDelete(null),
            onError: (err) => {
              setToDelete(null);
              setError(getErrorMessage(err, "Não foi possível excluir."));
            },
          });
        }}
        onClose={() => setToDelete(null)}
      />
    </Modal>
  );
}