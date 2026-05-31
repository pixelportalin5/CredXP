import api from "@/lib/api";
import type { Property } from "@/types/property";

const savedPropertyService = {
  list: (): Promise<{ data: Property[] }> =>
    api.get("/saved-properties"),

  save: (propertyId: string): Promise<{ data: Property }> =>
    api.post(`/saved-properties/${propertyId}`),

  remove: (propertyId: string): Promise<{ data: { propertyId: string } }> =>
    api.delete(`/saved-properties/${propertyId}`),
};

export default savedPropertyService;
