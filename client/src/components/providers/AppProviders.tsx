"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { PropertyComparisonProvider } from "./PropertyComparisonProvider";
import { ToastProvider } from "./ToastProvider";
import CompareFloatingBar from "@/components/property/CompareFloatingBar";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PropertyComparisonProvider>
        <AuthProvider>
          {children}
          <CompareFloatingBar />
        </AuthProvider>
      </PropertyComparisonProvider>
    </ToastProvider>
  );
}
