import { Eye, Search, UserCheck, UserX } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { useAdminUserDetail, useAdminUserMutations, useAdminUsers } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import type { AdminUser } from "@/types/admin";
import type { UserRole } from "@/types/auth";
import { formatDate } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";

const ROLE_LABEL: Record<UserRole, string> = { admin: "Admin", dev: "Dev", company: "Empresa" };
const ROLE_TONE = { admin: "yellow", dev: "green", company: "blue" } as const;

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.photo_url) return <img src={user.photo_url} alt="" className="size-11 rounded-full border border-white/15 object-cover" />;
  return (
    <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-flag-green to-flag-blue font-bold text-black">
      {(user.display_name || user.email).charAt(0).toUpperCase()}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-slate-200">{value || "—"}</dd>
    </div>
  );
}

function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { data, isLoading, isError, error } = useAdminUserDetail(userId);

  return (
    <Modal open={Boolean(userId)} onClose={onClose} title="Detalhes do usuário">
      {isLoading && <Spinner />}
      {isError && <p className="text-sm text-red-400">{getErrorMessage(error, "Não foi possível carregar o usuário.")}</p>}
      {data && (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="E-mail" value={data.user.email} />
            <Info label="Perfil" value={data.user.role_label ?? ROLE_LABEL[data.user.role]} />
            <Info label="Situação" value={data.user.is_active ? "Ativo" : "Desativado"} />
            <Info label="Verificado" value={data.user.is_trusty ? "Sim" : "Não"} />
            <Info label="Apoiador" value={data.user.is_patriot ? "Sim" : "Não"} />
            <Info label="Cadastro" value={formatDate(data.user.date_joined)} />
          </dl>

          {data.dev && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-white">Perfil do dev</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Nome" value={[data.dev.first_name, data.dev.last_name].filter(Boolean).join(" ")} />
                <Info label="Usuário" value={data.dev.username ? `@${data.dev.username}` : null} />
                <Info label="Título" value={data.dev.headline} />
                <Info label="WhatsApp" value={data.dev.whatsapp} />
                <Info label="GitHub" value={data.dev.github_url} />
                <Info label="LinkedIn" value={data.dev.linkedin_url} />
                <Info label="Site" value={data.dev.site_url} />
                <Info label="Currículo" value={data.dev.curriculum_url ? "Enviado" : "Não enviado"} />
              </dl>
              {data.dev.bio && <p className="mt-4 whitespace-pre-line text-sm text-slate-300">{data.dev.bio}</p>}
            </section>
          )}

          {data.company && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-white">Perfil da empresa</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Nome fantasia" value={data.company.full_name} />
                <Info label="Razão social" value={data.company.legal_name} />
                <Info label="CNPJ" value={data.company.cnpj} />
                <Info label="WhatsApp" value={data.company.whatsapp} />
                <Info label="Site" value={data.company.website} />
                <Info label="LinkedIn" value={data.company.linkedin_url} />
              </dl>
              {data.company.bio && <p className="mt-4 whitespace-pre-line text-sm text-slate-300">{data.company.bio}</p>}
            </section>
          )}

          {data.admin && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-white">Perfil do admin</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Nome" value={data.admin.full_name} />
              </dl>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}

const SCOPE = {
  all: { placeholder: "E-mail ou nome", empty: "Nenhum usuário encontrado", unit: "usuário(s)" },
  dev: { placeholder: "Nome do dev ou e-mail", empty: "Nenhum dev encontrado", unit: "dev(s)" },
  company: { placeholder: "Nome da empresa ou e-mail", empty: "Nenhuma empresa encontrada", unit: "empresa(s)" },
  admin: { placeholder: "E-mail ou nome", empty: "Nenhum admin encontrado", unit: "admin(s)" },
} as const;

/** Lista de usuários. Com `role` fixo vira a aba de Devs ou de Empresas (sem o filtro de perfil). */
export function AdminUsersPanel({ role: fixedRole }: { role?: UserRole }) {
  const { me } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const role = fixedRole ?? roleFilter;
  const scope = SCOPE[role || "all"];
  const [active, setActive] = useState<"true" | "false" | "">("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ user: AdminUser; action: "deactivate" | "reactivate" } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debounced = useDebounce(search.trim());
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminUsers({ search: debounced, role, is_active: active, page, page_size: 15 });
  const mutations = useAdminUserMutations();
  const busy = mutations.deactivate.isPending || mutations.reactivate.isPending;

  const confirm = () => {
    if (!pending) return;
    setActionError(null);
    mutations[pending.action].mutate(pending.user.user_id, {
      onSuccess: () => setPending(null),
      onError: (err) => {
        setPending(null);
        setActionError(getErrorMessage(err, "Não foi possível atualizar o usuário."));
      },
    });
  };

  return (
    <div>
      <div className={`grid gap-4 ${fixedRole ? "sm:grid-cols-[1fr_12rem]" : "sm:grid-cols-[1fr_12rem_12rem]"}`}>
        <Field label="Buscar">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={scope.placeholder}
              className="pl-9"
            />
          </div>
        </Field>
        {!fixedRole && (
          <Field label="Perfil">
            <Select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as UserRole | "");
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="dev">Devs</option>
              <option value="company">Empresas</option>
              <option value="admin">Admins</option>
            </Select>
          </Field>
        )}
        <Field label="Situação">
          <Select
            value={active}
            onChange={(event) => {
              setActive(event.target.value as "true" | "false" | "");
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            <option value="true">Ativos</option>
            <option value="false">Desativados</option>
          </Select>
        </Field>
      </div>

      {actionError && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      <div className="mt-6">
        {isLoading && <Spinner />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}
        {data && data.items.length === 0 && <EmptyState title={scope.empty}>Ajuste a busca ou os filtros.</EmptyState>}
        {data && data.items.length > 0 && (
          <>
            <p className="mb-3 text-xs text-slate-500">
              {data.total} {scope.unit}
            </p>
            <div className={`grid gap-3 ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((user) => {
                const self = user.user_id === me?.user.user_id;
                return (
                  <Panel key={user.user_id} className="flex flex-wrap items-center gap-4 p-4">
                    <UserAvatar user={user} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{user.display_name || user.email}</p>
                      <p className="truncate text-xs text-slate-500">{user.display_name ? user.email : "Sem perfil preenchido"}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone={ROLE_TONE[user.role]}>{user.role_label ?? ROLE_LABEL[user.role]}</Badge>
                        <Badge tone={user.is_active ? "green" : "red"}>{user.is_active ? "Ativo" : "Desativado"}</Badge>
                        {user.is_trusty && <Badge tone="purple">Verificado</Badge>}
                        <Badge>Desde {formatDate(user.date_joined)}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setDetailId(user.user_id)}>
                        <Eye className="size-4" aria-hidden /> Detalhes
                      </Button>
                      {!self &&
                        (user.is_active ? (
                          <Button variant="danger" size="sm" onClick={() => setPending({ user, action: "deactivate" })}>
                            <UserX className="size-4" aria-hidden /> Desativar
                          </Button>
                        ) : (
                          <Button variant="purple" size="sm" onClick={() => setPending({ user, action: "reactivate" })}>
                            <UserCheck className="size-4" aria-hidden /> Reativar
                          </Button>
                        ))}
                    </div>
                  </Panel>
                );
              })}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </div>

      <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.action === "deactivate" ? "Desativar usuário" : "Reativar usuário"}
        message={
          pending?.action === "deactivate"
            ? `${pending.user.email} será desconectado e não poderá mais entrar. Ele recebe um e-mail avisando.`
            : `${pending?.user.email} volta a poder entrar na plataforma. Ele recebe um e-mail avisando.`
        }
        confirmLabel={pending?.action === "deactivate" ? "Desativar" : "Reativar"}
        variant={pending?.action === "deactivate" ? "danger" : "primary"}
        loading={busy}
        onConfirm={confirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}