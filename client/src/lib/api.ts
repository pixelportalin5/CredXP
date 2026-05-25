import axios from "axios";

/**
 * Configured Axios instance for CredXP API
 * Centralizes base URL, headers, timeout, and error handling.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Response interceptor — unwrap data envelope
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    console.error("[CredXP API Error]", message);
    return Promise.reject(new Error(message));
  }
);

export default api;
