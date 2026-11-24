import { Images, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";

import { CampaignFormModal } from "@/components/admin/CampaignFormModal";
import { CampaignImagesModal } from "@/components/admin/CampaignImagesModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAdminCampaignMutations, useAdminCampaigns } from "@/hooks/useAdmin";
import type { AdminCampaign } from "@/types/admin";
import { getErrorMessage } from "@/utils/errors";
import { formatDate } from "@/utils/format";

function periodLabel(campaign: AdminCampaign): string {
  if (!campaign.starts_at && !campaign.ends_at) return "Sem prazo definido";
  const from = campaign.starts_at ? formatDate(campaign.starts_at) : "agora";
  const to = campaign.ends_at ? formatDate(campaign.ends_at) : "sem fim";
  return `${from} → ${to}`;
}

/** Ativa e dentro da janela de vigência (o que a home realmente mostra). */
function isRunning(campaign: AdminCampaign): boolean {
  const now = Date.now();
  if (!campaign.is_active) return false;
  if (campaign.starts_at && new Date(campaign.starts_at).getTime() > now) return false;
  if (campaign.ends_at && new Date(campaign.ends_at).getTime() < now) return false;
  return true;
}

export function AdminCampaignsPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminCampaign | "new" | null>(null);
  const [imagesOf, setImagesOf] = useState<AdminCampaign | null>(null);
  const [toDelete, setToDelete] = useState<AdminCampaign | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCampaigns(page);
  const { activate, deactivate, remove } = useAdminCampaignMutations();

  const toggle = (campaign: AdminCampaign) => {
    setActionError(null);
    (campaign.is_active ? deactivate : activate).mutate(campaign.campaign_id, { onError: (err) => setActionError(getErrorMessage(err)) });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Campanhas e banners exibidos na home. Só as ativas e dentro do período aparecem para o público.</p>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden /> Nova campanha
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {actionError}
        </p>
      )}

      <div className="mt-6">
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhuma campanha">Crie a primeira para subir banners na home.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <div className={`grid gap-4 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((campaign) => (
                <Panel key={campaign.campaign_id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">{campaign.title}</h3>
                        <Badge tone={campaign.is_active ? "green" : "neutral"}>{campaign.is_active ? "Ativa" : "Desativada"}</Badge>
                        {campaign.is_active && !isRunning(campaign) && <Badge tone="yellow">Fora do período</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{periodLabel(campaign)}</p>
                      {campaign.description && <p className="mt-3 line-clamp-3 text-sm text-slate-300">{campaign.description}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setImagesOf(campaign)}>
                        <Images className="size-4" aria-hidden /> Banners
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditing(campaign)}>
                        <Pencil className="size-4" aria-hidden /> Editar
                      </Button>
                      <Button variant={campaign.is_active ? "ghost" : "purple"} size="sm" loading={activate.isPending || deactivate.isPending} onClick={() => toggle(campaign)}>
                        {campaign.is_active ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />}
                        {campaign.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button variant="danger" size="sm" aria-label="Excluir campanha" onClick={() => setToDelete(campaign)}>
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </div>

      {editing && (
        <CampaignFormModal key={editing === "new" ? "new" : editing.campaign_id} open campaign={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
      <CampaignImagesModal campaign={imagesOf} onClose={() => setImagesOf(null)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir campanha"
        message={`"${toDelete?.title ?? ""}" e todos os banners dela serão removidos.`}
        loading={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          setActionError(null);
          remove.mutate(toDelete.campaign_id, {
            onSuccess: () => setToDelete(null),
            onError: (err) => {
              setToDelete(null);
              setActionError(getErrorMessage(err, "Não foi possível excluir."));
            },
          });
        }}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}