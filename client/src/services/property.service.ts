import api from "@/lib/api";
import type { Property, PropertyListResponse } from "@/types/property";

/**
 * Property API service
 * All property-related API calls centralized here
 */
const propertyService = {
  /** Get properties with optional filters */
  getAll: (params: Record<string, unknown> = {}): Promise<{ data: PropertyListResponse }> =>
    api.get("/properties", { params }),

  /** Get a single property by ID */
  getById: (id: string): Promise<{ data: Property }> =>
    api.get(`/properties/${id}`),

  /** Search properties by query */
  search: (params: Record<string, unknown> = {}): Promise<{ data: PropertyListResponse }> =>
    api.get("/properties/search", { params }),

  /** Get properties by status (homepage sections) */
  getByStatus: (status: string, limit: number = 6): Promise<{ data: Property[] }> =>
    api.get(`/properties/status/${encodeURIComponent(status)}`, {
      params: { limit },
    }),

  /** Create a new property (admin) */
  create: (data: Partial<Property>): Promise<{ data: Property }> =>
    api.post("/properties", data),
};

export default propertyService;
