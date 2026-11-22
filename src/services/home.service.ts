import { api } from "@/lib/api";
import type { HomeData } from "@/types/home";

export const homeService = {
  /** Público, sem login. Uma chamada traz stats, regiões, vagas em destaque e atividade recente. */
  async get(): Promise<HomeData> {
    const { data } = await api.get<HomeData>("/home/");
    return data;
  },
};