import { z } from "zod";

/** Espelha o que o backend recusa sem precisar de ida e volta: curta demais ou só números. */
export const passwordSchema = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .refine((value) => !/^\d+$/.test(value), "A senha não pode ser só números");