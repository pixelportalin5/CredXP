import api from "@/lib/api";
import type { Property, PropertyListResponse } from "@/types/property";

export interface BulkUploadRowResult {
  row: number;
  success: boolean;
  propertyId?: string;
  title?: string;
  errors?: string[];
}

export interface BulkUploadResult {
  totalRows: number;
  createdCount: number;
  failedCount: number;
  results: BulkUploadRowResult[];
}

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

  /** Get current seller's listings */
  getMyProperties: (): Promise<{ data: Property[] }> =>
    api.get("/properties/seller/my-properties"),

  /** Update a seller-owned property */
  update: (id: string, data: Partial<Property>): Promise<{ data: Property }> =>
    api.put(`/properties/${id}`, data),

  /** Delete a seller-owned property */
  delete: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/properties/${id}`),

  /** Download Excel template for bulk listing upload */
  downloadBulkTemplate: (): Promise<Blob> =>
    api.get("/properties/bulk/template", { responseType: "blob" }),

  /** Upload Excel + image ZIP for bulk property creation */
  bulkUpload: (excel: File, imagesZip: File): Promise<{ data: BulkUploadResult }> => {
    const formData = new FormData();
    formData.append("excel", excel);
    formData.append("imagesZip", imagesZip);

    return api.post("/properties/bulk/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
  },
};

export default propertyService;
