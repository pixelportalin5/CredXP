"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info";
type ToastInput = { title: string; message?: string; type?: ToastType };
type Toast = ToastInput & { id: number; type: ToastType };

const ToastContext = createContext<{ showToast: (toast: ToastInput) => void } | null>(null);

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = Date.now();
    const nextToast: Toast = { ...toast, id, type: toast.type || "info" };
    setToasts((current) => [...current, nextToast]);
    window.setTimeout(() => removeToast(id), 4200);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-28 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "rounded-2xl border bg-white p-4 text-slate-900 shadow-xl",
                toast.type === "success" && "border-emerald-200",
                toast.type === "error" && "border-red-200",
                toast.type === "info" && "border-slate-200"
              )}
            >
              <div className="flex gap-3">
                <Icon className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  toast.type === "success" && "text-emerald-600",
                  toast.type === "error" && "text-red-500",
                  toast.type === "info" && "text-accent-500"
                )} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message && <p className="mt-1 text-xs leading-5 text-slate-600">{toast.message}</p>}
                </div>
                <button type="button" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
