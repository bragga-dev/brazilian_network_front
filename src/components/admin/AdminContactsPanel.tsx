import { Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAdminContactMutations, useAdminContacts } from "@/hooks/useAdmin";
import { useDebounce } from "@/hooks/useDebounce";
import type { AdminContact, ContactStatus } from "@/types/admin";
import { getErrorMessage } from "@/utils/errors";
import { formatTimeAgo } from "@/utils/format";

export const CONTACT_STATUS: { value: ContactStatus; label: string; tone: "yellow" | "blue" | "green" | "neutral" }[] = [
  { value: "pending", label: "Pendente", tone: "yellow" },
  { value: "in_progress", label: "Em andamento", tone: "blue" },
  { value: "resolved", label: "Resolvido", tone: "green" },
  { value: "archived", label: "Arquivado", tone: "neutral" },
];

function ContactCard({ contact, onDelete }: { contact: AdminContact; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setStatus } = useAdminContactMutations();
  const status = CONTACT_STATUS.find((item) => item.value === contact.status);
  const long = contact.message.length > 220;

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{contact.subject}</h3>
            <Badge tone={status?.tone}>{contact.status_label}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {contact.full_name} · <span className="text-slate-500">{formatTimeAgo(contact.created_at)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Alterar status"
            value={contact.status}
            disabled={setStatus.isPending}
            className="w-40 py-2"
            onChange={(event) => {
              setError(null);
              setStatus.mutate({ id: contact.contact_id, status: event.target.value as ContactStatus }, { onError: (err) => setError(getErrorMessage(err)) });
            }}
          >
            {CONTACT_STATUS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Button variant="danger" size="sm" aria-label="Excluir mensagem" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <p className={`mt-4 whitespace-pre-line text-sm text-slate-300 ${expanded ? "" : "line-clamp-4"}`}>{contact.message}</p>
      {long && (
        <button onClick={() => setExpanded((value) => !value)} className="mt-1 text-xs text-flag-green hover:underline">
          {expanded ? "Mostrar menos" : "Ler mensagem completa"}
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Re: ${contact.subject}`)}`} className={buttonClasses("secondary", "sm")}>
          <Mail className="size-4" aria-hidden /> {contact.email}
        </a>
        <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={buttonClasses("ghost", "sm")}>
          <Phone className="size-4" aria-hidden /> {contact.phone}
        </a>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </Panel>
  );
}

export function AdminContactsPanel() {
  const [status, setStatus] = useState<ContactStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminContact | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const debounced = useDebounce(search.trim());
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminContacts({ status, search: debounced, page, page_size: 10 });
  const { remove } = useAdminContactMutations();

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <Field label="Buscar">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Nome, e-mail ou assunto"
          />
        </Field>
        <Field label="Status">
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ContactStatus | "");
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {CONTACT_STATUS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {deleteError && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      <div className="mt-6">
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title="Nenhuma mensagem">Quando alguém usar o formulário de contato, aparece aqui.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <p className="mb-3 text-xs text-slate-500">{data.total} mensagem(ns)</p>
            <div className={`grid gap-4 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((contact) => (
                <ContactCard key={contact.contact_id} contact={contact} onDelete={() => setToDelete(contact)} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir mensagem"
        message={`A mensagem de ${toDelete?.full_name ?? ""} será apagada de vez. Para guardar sem apagar, use "Arquivado".`}
        loading={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          setDeleteError(null);
          remove.mutate(toDelete.contact_id, {
            onSuccess: () => setToDelete(null),
            onError: (err) => {
              setToDelete(null);
              setDeleteError(getErrorMessage(err, "Não foi possível excluir."));
            },
          });
        }}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}