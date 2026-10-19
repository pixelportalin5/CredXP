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
    listeners.forEach((listener) => listener());
  }
  return normalized;
}

// External-store bindings for useSyncExternalStore: same-tab writes notify
// listeners directly, other tabs are picked up via the storage event.
const listeners = new Set<() => void>();
const EMPTY_IDS: string[] = [];
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY_IDS;

export function subscribeCompareIds(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getCompareIdsSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_IDS;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIds = readCompareIds();
  }
  return cachedIds;
}

export function getCompareIdsServerSnapshot(): string[] {
  return EMPTY_IDS;
}
