const STORAGE_KEY = "credxp_property_compare";
export const MAX_COMPARE_PROPERTIES = 3;

export function readCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, MAX_COMPARE_PROPERTIES);
  } catch {
    return [];
  }
}

export function writeCompareIds(ids: string[]): string[] {
  const normalized = [...new Set(ids)].slice(0, MAX_COMPARE_PROPERTIES);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}
