import api from "@/lib/api";
import type { CoworkingSpace } from "@/types/coworking";

const coworkingService = {
  getAll: (): Promise<{ data: CoworkingSpace[] }> =>
    api.get("/coworking"),

  getById: (id: string): Promise<{ data: CoworkingSpace }> =>
    api.get(`/coworking/${id}`),
};

export default coworkingService;
