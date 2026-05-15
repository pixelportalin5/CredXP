"use client";

import { useState, useEffect, useCallback } from "react";
import propertyService from "@/services/propertyService";

/**
 * Custom hook to fetch properties with loading/error state
 * @param {Object} initialParams - initial query params
 */
export function useProperties(initialParams = {}) {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const res = await propertyService.getAll(params);
      setProperties(res.data.properties);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, pagination, loading, error, refetch: fetchProperties };
}
