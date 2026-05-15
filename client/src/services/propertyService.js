import api from "@/lib/axios";

/**
 * Property API service – all property-related API calls
 */
const propertyService = {
  /**
   * Get all properties with optional filters
   * @param {Object} params - { page, limit, type, status, city, minPrice, maxPrice, sort }
   */
  getAll: (params = {}) => api.get("/properties", { params }),

  /**
   * Get a single property by ID
   * @param {string} id
   */
  getById: (id) => api.get(`/properties/${id}`),

  /**
   * Search properties
   * @param {Object} params - { q, type, city, minPrice, maxPrice, sort, page, limit }
   */
  search: (params = {}) => api.get("/properties/search", { params }),

  /**
   * Get properties by status (for homepage sections)
   * @param {string} status - "Recently Posted" or "Trending"
   * @param {number} limit
   */
  getByStatus: (status, limit = 6) =>
    api.get(`/properties/status/${encodeURIComponent(status)}`, { params: { limit } }),

  /**
   * Create a new property
   * @param {Object} data - property payload
   */
  create: (data) => api.post("/properties", data),
};

export default propertyService;
