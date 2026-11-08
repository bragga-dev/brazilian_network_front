import { Button } from "@/components/ui/Button";

export function FormActions({ onCancel, loading, submitLabel = "Salvar" }: { onCancel: () => void; loading: boolean; submitLabel?: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" size="sm" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}