import { api } from "@/lib/api";
import type {
  Course, CourseInput, CourseUpdate, DevTechnology, DevTechnologyInput, DevTechnologyUpdate, Education, EducationInput,
  EducationUpdate, Experience, ExperienceInput, ExperienceUpdate, MyProfile, PublicProfile, TechnologyCategory, TechnologyPage,
} from "@/types/profile";

/** CRUD padrão das seções do perfil (todas: GET /, POST /, PATCH /{id}, DELETE /{id}; DELETE devolve 204). */
function section<T, I, U>(base: string) {
  return {
    list: async () => (await api.get<T[]>(base)).data,
    create: async (input: I) => (await api.post<T>(base, input)).data,
    update: async ({ id, data }: { id: string; data: U }) => (await api.patch<T>(`${base}${id}`, data)).data,
    remove: async (id: string) => {
      await api.delete(`${base}${id}`);
    },
  };
}

export const profileService = {
  async mine(): Promise<MyProfile> {
    return (await api.get<MyProfile>("/profile/me")).data;
  },

  async publicProfile(devId: string): Promise<PublicProfile> {
    return (await api.get<PublicProfile>(`/profile/devs/${devId}`)).data;
  },

  educations: section<Education, EducationInput, EducationUpdate>("/profile/educations/"),
  experiences: section<Experience, ExperienceInput, ExperienceUpdate>("/profile/experiences/"),
  courses: section<Course, CourseInput, CourseUpdate>("/profile/courses/"),
  technologies: section<DevTechnology, DevTechnologyInput, DevTechnologyUpdate>("/profile/technologies/"),

  async catalog(params: { q?: string; category_id?: string; page?: number; page_size?: number }): Promise<TechnologyPage> {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
    return (await api.get<TechnologyPage>("/profile/catalog/technologies", { params: clean })).data;
  },

  async categories(): Promise<TechnologyCategory[]> {
    return (await api.get<TechnologyCategory[]>("/profile/catalog/categories")).data;
  },
};