import api from "@/lib/api";
import type { Enquiry } from "@/types/enquiry";
import type { Property } from "@/types/property";
import type { CoworkingSpace } from "@/types/coworking";
import type { User } from "@/types/auth";

export interface AdminSummary {
  metrics: {
    totalUsers: number;
    activeSellers: number;
    activeListings: number;
    openEnquiries: number;
    closedEnquiries: number;
    savedPropertyCount: number;
  };
  dataQuality: {
    missingImages: number;
    missingReraId: number;
    missingTenant: number;
    missingFinancials: number;
  };
}

export interface AdminAuditLog {
  _id: string;
  actor?: Pick<User, "_id" | "name" | "email" | "role">;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type AdminUser = User & {
  accountStatus?: "active" | "disabled";
};

export interface ZohoImportSummary {
  trigger: string;
  startedAt: string;
  finishedAt?: string;
  total: number;
  created: number;
  updated: number;
  hidden: number;
  failed: { zohoId: string; name: string; error: string }[];
}

export interface ZohoSyncStatus {
  apiConfigured: boolean;
  webhookConfigured: boolean;
  module: string;
  scheduleMinutes: number | null;
  importRunning: boolean;
  lastImport: ZohoImportSummary | null;
}

const adminService = {
  getZohoStatus: (): Promise<{ data: ZohoSyncStatus }> =>
    api.get("/integrations/zoho/status"),

  // Large Zoho modules can take a few minutes (images are copied too).
  importFromZoho: (): Promise<{ data: ZohoImportSummary }> =>
    api.post("/integrations/zoho/import", undefined, { timeout: 10 * 60 * 1000 }),

  getSummary: (): Promise<{ data: AdminSummary }> =>
    api.get("/admin/summary"),

  getUsers: (params: Record<string, unknown> = {}): Promise<{ data: AdminUser[] }> =>
    api.get("/admin/users", { params }),

  updateUser: (id: string, data: Partial<AdminUser>): Promise<{ data: AdminUser }> =>
    api.patch(`/admin/users/${id}`, data),

  getEnquiries: (params: Record<string, unknown> = {}): Promise<{ data: Enquiry[] }> =>
    api.get("/admin/enquiries", { params }),

  updateEnquiryStatus: (id: string, status: "open" | "closed"): Promise<{ data: Enquiry }> =>
    api.patch(`/admin/enquiries/${id}/status`, { status }),

  getLogs: (): Promise<{ data: AdminAuditLog[] }> =>
    api.get("/admin/logs"),

  getProperties: (params: Record<string, unknown> = {}): Promise<{ data: Property[] }> =>
    api.get("/admin/properties", { params }),

  createProperty: (data: Partial<Property>): Promise<{ data: Property }> =>
    api.post("/admin/properties", data),

  updateProperty: (id: string, data: Partial<Property>): Promise<{ data: Property }> =>
    api.patch(`/admin/properties/${id}`, data),

  deleteProperty: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/admin/properties/${id}`),

  getCoworkingSpaces: (params: Record<string, unknown> = {}): Promise<{ data: CoworkingSpace[] }> =>
    api.get("/admin/coworking", { params }),

  createCoworkingSpace: (data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.post("/admin/coworking", data),

  updateCoworkingSpace: (id: string, data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.patch(`/admin/coworking/${id}`, data),

  deleteCoworkingSpace: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/admin/coworking/${id}`),
};

export default adminService;
