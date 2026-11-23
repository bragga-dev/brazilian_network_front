import { z } from "zod";

const MAX_MONEY = 99_999_999.99; // Decimal(10, 2) do backend

/** Texto opcional com valor em reais: vazio é aceito; senão número >= 0 com até 2 casas. */
export const optionalMoney = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+([.,]\d{1,2})?$/.test(v) && Number(v.replace(",", ".")) <= MAX_MONEY), "Informe um valor válido, com até 2 casas decimais");

/** "1500,5" -> "1500.50"; vazio -> null (limpa o campo no PATCH). */
export function moneyToApi(value: string): string | null {
  const text = value.trim();
  return text === "" ? null : Number(text.replace(",", ".")).toFixed(2);
}

export function moneyToForm(value: string | null | undefined): string {
  return value == null ? "" : String(Number(value));
}