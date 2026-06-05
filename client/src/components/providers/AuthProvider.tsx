"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import authService from "@/services/auth.service";
import type { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: "buyer" | "seller" }) => Promise<User>;
  refreshUser: () => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    window.queueMicrotask(() => {
      const storedToken = window.localStorage.getItem("credxp_token");
      if (!active) return;

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      authService.me()
        .then((res) => {
          if (active) setUser(res.data);
        })
        .catch(() => {
          window.localStorage.removeItem("credxp_token");
          if (active) setToken(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    window.localStorage.setItem("credxp_token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }, [persistSession]);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string; role?: "buyer" | "seller" }) => {
    const res = await authService.register(data);
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    const res = await authService.me();
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("credxp_token");
    setToken(null);
    setUser(null);
    setLoading(false);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, refreshUser, logout }),
    [user, token, loading, login, register, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
