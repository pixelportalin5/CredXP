"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className={cn("flex-1", !isHome && "pt-28")}>
      {children}
    </main>
  );
}
