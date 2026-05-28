import api from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ data: AuthResponse }> => api.post("/auth/register", data),

  login: (data: {
    email: string;
    password: string;
  }): Promise<{ data: AuthResponse }> => api.post("/auth/login", data),

  me: (): Promise<{ data: User }> => api.get("/auth/me"),
};

export default authService;
