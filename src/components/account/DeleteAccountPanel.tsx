import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/errors";

import { FormMessage } from "../layout/AuthShell";

export function DeleteAccountPanel() {
  const { endSession } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.deleteAccount(password);
      endSession();
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível excluir a conta."));
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Excluir minha conta
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <p className="text-sm text-slate-300">
        Isso apaga definitivamente sua conta, perfil e endereços, e encerra todas as sessões. Não dá para desfazer. Confirme com a sua senha.
      </p>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <Field label="Senha">
        <PasswordInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button variant="danger" size="sm" loading={busy} disabled={!password} onClick={() => void remove()}>
          Excluir definitivamente
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}