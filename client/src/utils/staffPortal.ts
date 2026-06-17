export type StaffPortal = "admin" | "employee";

export function getStaffPortalFromRole(role?: string): StaffPortal | null {
  if (role === "admin") return "admin";
  if (role === "employee") return "employee";
  return null;
}

export function getStaffPortalFromPath(pathname: string): StaffPortal {
  return pathname.startsWith("/employee") ? "employee" : "admin";
}

export function getDashboardPath(portal: StaffPortal): string {
  return portal === "admin" ? "/admin/dashboard" : "/employee/dashboard";
}

export function getDashboardPathForRole(role?: string): string | null {
  const portal = getStaffPortalFromRole(role);
  return portal ? getDashboardPath(portal) : null;
}

export function getProposalsDashboardHref(role?: string): string {
  const base = getDashboardPathForRole(role);
  return base ? `${base}?section=proposals` : "/admin/dashboard?section=proposals";
}

export function getStaffEditPath(
  portal: StaffPortal,
  type: "properties" | "coworking",
  id: string,
  from?: string
): string {
  const section = from || (type === "properties" ? "properties" : "coworking");
  return `${getDashboardPath(portal)}/${type}/${id}/edit?from=${section}`;
}
