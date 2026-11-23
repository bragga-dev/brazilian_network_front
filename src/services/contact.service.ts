import { api } from "@/lib/api";

export interface ContactInput {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const contactService = {
  /** Formulário público (sem login). O backend limita a 5 envios por minuto por IP. */
  async send(input: ContactInput): Promise<void> {
    await api.post("/contact/", input);
  },
};