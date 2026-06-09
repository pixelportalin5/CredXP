export const isStaff = (role?: string): boolean => role === "admin" || role === "employee";

export const isAdmin = (role?: string): boolean => role === "admin";
