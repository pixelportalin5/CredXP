"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MAX_COMPARE_PROPERTIES,
  readCompareIds,
  writeCompareIds,
} from "@/utils/propertyComparisonStorage";

type CompareResult =
  | { ok: true; action: "added" | "removed" }
  | { ok: false; reason: "duplicate" | "max" };

interface PropertyComparisonContextValue {
  ids: string[];
  count: number;
  max: number;
  isInCompare: (propertyId: string) => boolean;
  canAdd: (propertyId: string) => boolean;
  toggleCompare: (propertyId: string) => CompareResult;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
}

const PropertyComparisonContext = createContext<PropertyComparisonContextValue | null>(null);

export function PropertyComparisonProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readCompareIds());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "credxp_property_compare") {
        setIds(readCompareIds());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    const normalized = writeCompareIds(next);
    setIds(normalized);
    return normalized;
  }, []);

  const isInCompare = useCallback((propertyId: string) => ids.includes(propertyId), [ids]);

  const canAdd = useCallback(
    (propertyId: string) => isInCompare(propertyId) || ids.length < MAX_COMPARE_PROPERTIES,
    [ids, isInCompare]
  );

  const removeFromCompare = useCallback(
    (propertyId: string) => {
      persist(ids.filter((id) => id !== propertyId));
    },
    [ids, persist]
  );

  const clearCompare = useCallback(() => {
    persist([]);
  }, [persist]);

  const toggleCompare = useCallback(
    (propertyId: string): CompareResult => {
      if (isInCompare(propertyId)) {
        removeFromCompare(propertyId);
        return { ok: true, action: "removed" };
      }
      if (ids.length >= MAX_COMPARE_PROPERTIES) {
        return { ok: false, reason: "max" };
      }
      persist([...ids, propertyId]);
      return { ok: true, action: "added" };
    },
    [ids, isInCompare, persist, removeFromCompare]
  );

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      max: MAX_COMPARE_PROPERTIES,
      isInCompare,
      canAdd,
      toggleCompare,
      removeFromCompare,
      clearCompare,
    }),
    [ids, isInCompare, canAdd, toggleCompare, removeFromCompare, clearCompare]
  );

  return (
    <PropertyComparisonContext.Provider value={value}>{children}</PropertyComparisonContext.Provider>
  );
}

export function usePropertyComparison() {
  const context = useContext(PropertyComparisonContext);
  if (!context) {
    throw new Error("usePropertyComparison must be used within PropertyComparisonProvider");
  }
  return context;
}
