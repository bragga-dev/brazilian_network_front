import { isAxiosError } from "axios";

import type { MessageOut, ValidationErrorOut } from "@/types/common";

export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (!isAxiosError<MessageOut | ValidationErrorOut>(error)) return fallback;
  if (!error.response) return "Sem conexão com o servidor.";

  const data = error.response.data;
  if (error.response.status === 429) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  if (data && "errors" in data && data.errors?.length) {
    return data.errors.map((e) => e.message.replace(/^Value error, /, "")).join(" ");
  }
  return data?.detail ?? fallback;
}

export function getStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
