import api from "@/lib/api";
import type { AuthResponse, User } from "@/types/auth";

export interface OtpSignupRequired {
  needsSignup: true;
  signupToken: string;
  phone: string;
}

const authService = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "buyer" | "seller";
  }): Promise<{ data: AuthResponse }> => api.post("/auth/register", data),

  login: (data: {
    email: string;
    password: string;
  }): Promise<{ data: AuthResponse }> => api.post("/auth/login", data),

  sendOtp: (phone: string): Promise<{ data: { phone: string; expiresInSeconds: number; resendAfterSeconds: number } }> =>
    api.post("/auth/otp/send", { phone }),

  verifyOtp: (data: { phone: string; code: string }): Promise<{ data: AuthResponse | OtpSignupRequired }> =>
    api.post("/auth/otp/verify", data),

  completeOtpSignup: (data: {
    signupToken: string;
    name: string;
    email: string;
    role?: "buyer" | "seller";
  }): Promise<{ data: AuthResponse }> => api.post("/auth/otp/register", data),

  me: (): Promise<{ data: User }> => api.get("/auth/me"),

  updateMe: (data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    avatarPublicId?: string;
  }): Promise<{ data: User }> => api.patch("/auth/me", data),

  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ data: User }> => api.patch("/auth/password", data),
};

export default authService;
