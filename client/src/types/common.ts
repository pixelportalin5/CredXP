/* ============================================================
   Common / Shared Types
   ============================================================ */

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface NavLink {
  href: string;
  label: string;
  children?: NavLink[];
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
