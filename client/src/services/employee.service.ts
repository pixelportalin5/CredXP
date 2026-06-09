import api from "@/lib/api";
import type { Enquiry } from "@/types/enquiry";
import type { Property } from "@/types/property";
import type { CoworkingSpace } from "@/types/coworking";
import type { AdminAuditLog, AdminSummary } from "@/services/admin.service";

const employeeService = {
  getSummary: (): Promise<{ data: AdminSummary }> =>
    api.get("/employee/summary"),

  getEnquiries: (params: Record<string, unknown> = {}): Promise<{ data: Enquiry[] }> =>
    api.get("/employee/enquiries", { params }),

  updateEnquiryStatus: (id: string, status: "open" | "closed"): Promise<{ data: Enquiry }> =>
    api.patch(`/employee/enquiries/${id}/status`, { status }),

  getLogs: (): Promise<{ data: AdminAuditLog[] }> =>
    api.get("/employee/logs"),

  getProperties: (params: Record<string, unknown> = {}): Promise<{ data: Property[] }> =>
    api.get("/employee/properties", { params }),

  createProperty: (data: Partial<Property>): Promise<{ data: Property }> =>
    api.post("/employee/properties", data),

  updateProperty: (id: string, data: Partial<Property>): Promise<{ data: Property }> =>
    api.patch(`/employee/properties/${id}`, data),

  deleteProperty: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/employee/properties/${id}`),

  getCoworkingSpaces: (params: Record<string, unknown> = {}): Promise<{ data: CoworkingSpace[] }> =>
    api.get("/employee/coworking", { params }),

  createCoworkingSpace: (data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.post("/employee/coworking", data),

  updateCoworkingSpace: (id: string, data: Partial<CoworkingSpace>): Promise<{ data: CoworkingSpace }> =>
    api.patch(`/employee/coworking/${id}`, data),

  deleteCoworkingSpace: (id: string): Promise<{ data: { id: string } }> =>
    api.delete(`/employee/coworking/${id}`),
};

export default employeeService;
