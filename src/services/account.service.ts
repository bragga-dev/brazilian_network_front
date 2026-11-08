import { api } from "@/lib/api";
import type { CompanyProfile, DevProfile } from "@/types/auth";
import type { Address, AddressInput, AddressOwner, CompanyUpdateInput, DevUpdateInput, MyDev } from "@/types/profile";

function form(field: string, file: File): FormData {
  const data = new FormData();
  data.append(field, file);
  return data;
}

export const accountService = {
  // ---- dev ----
  async updateDev(input: DevUpdateInput): Promise<MyDev> {
    return (await api.patch<MyDev>("/dev/profile", input)).data;
  },
  async uploadDevPhoto(file: File): Promise<MyDev> {
    return (await api.post<MyDev>("/dev/photo", form("photo", file))).data;
  },
  async deleteDevPhoto(): Promise<MyDev> {
    return (await api.delete<MyDev>("/dev/photo")).data;
  },
  async uploadCurriculum(file: File): Promise<MyDev> {
    return (await api.post<MyDev>("/dev/curriculum", form("curriculum", file))).data;
  },
  async deleteCurriculum(): Promise<MyDev> {
    return (await api.delete<MyDev>("/dev/curriculum")).data;
  },

  // ---- empresa ----
  async updateCompany(input: CompanyUpdateInput): Promise<CompanyProfile> {
    return (await api.patch<CompanyProfile>("/company/profile", input)).data;
  },
  async uploadCompanyPhoto(file: File): Promise<CompanyProfile> {
    return (await api.post<CompanyProfile>("/company/photo", form("photo", file))).data;
  },
  async deleteCompanyPhoto(): Promise<CompanyProfile> {
    return (await api.delete<CompanyProfile>("/company/photo")).data;
  },

  // ---- endereços (mesmo contrato para dev e empresa) ----
  async listAddresses(owner: AddressOwner): Promise<Address[]> {
    return (await api.get<Address[]>(`/address/${owner}/my-addresses`)).data;
  },
  async createAddress(owner: AddressOwner, input: AddressInput): Promise<Address> {
    return (await api.post<Address>(`/address/${owner}/my-addresses`, input)).data;
  },
  async updateAddress(owner: AddressOwner, id: string, input: Partial<AddressInput>): Promise<Address> {
    return (await api.patch<Address>(`/address/${owner}/my-addresses/${id}`, input)).data;
  },
  async deleteAddress(owner: AddressOwner, id: string): Promise<void> {
    await api.delete(`/address/${owner}/my-addresses/${id}`);
  },
  async setPreferentialAddress(owner: AddressOwner, id: string): Promise<Address> {
    return (await api.post<Address>(`/address/${owner}/my-addresses/${id}/set-preferential`)).data;
  },
};

export type { DevProfile };