import api from "@/lib/api";
import type { CoworkingSpace } from "@/types/coworking";
import type { Pagination } from "@/types/common";

const coworkingService = {
  getAll: (params: Record<string, unknown> = {}): Promise<{ data: CoworkingSpace[]; pagination?: Pagination }> =>
    api.get("/coworking", { params }),

  getById: (id: string): Promise<{ data: CoworkingSpace }> =>
    api.get(`/coworking/${id}`),

  getMySpaces: (): Promise<{ data: CoworkingSpace[] }> =>
    api.get("/coworking/seller/my-spaces"),

  create: (data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.post("/coworking", data),

  update: (id: string, data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.put(`/coworking/${id}`, data),

  delete: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/coworking/${id}`),
};

export default coworkingService;
