import { api } from "@/lib/api";
import type { WorkArea } from "@/types/technology";

export const areaService = {
  async list(): Promise<WorkArea[]> {
    return (await api.get<WorkArea[]>("/profile/catalog/areas")).data;
  },
};