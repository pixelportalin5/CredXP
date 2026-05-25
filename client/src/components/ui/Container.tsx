import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ============================================================
   Container — Layout Primitive
   Constrains content width with consistent padding
   ============================================================ */

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: "div" | "section" | "main" | "article";
}

const sizeStyles: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

function Container({
  children,
  className,
  size = "lg",
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

export { Container };
export type { ContainerProps };
