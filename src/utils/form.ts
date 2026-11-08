/**
 * Monta o corpo do PATCH só com os campos alterados.
 * O backend ignora `null` (não limpa nada), então campo de texto apagado vai como "".
 * Campos em `skipWhenEmpty` (data, enum, username) não aceitam vazio: são omitidos.
 */
export function buildPatch<T extends Record<string, unknown>>(values: T, dirty: Record<string, unknown>, skipWhenEmpty: string[] = []): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(dirty)) {
    let value: unknown = values[key];
    if (typeof value === "string") {
      value = value.trim();
      if (value === "" && skipWhenEmpty.includes(key)) continue;
    }
    patch[key] = value;
  }
  return patch;
}

export const emptyToUndefined = (value: string | undefined): string | undefined => (value && value.trim() ? value.trim() : undefined);