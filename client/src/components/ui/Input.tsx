import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

/* ============================================================
   Input — Design System Primitive
   ============================================================ */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-100",
              "placeholder:text-navy-500",
              "outline-none transition-all duration-200",
              "border-[var(--border-default)]",
              "focus:border-[var(--border-focus)] focus:ring-1 focus:ring-accent-500/20",
              "hover:border-[var(--border-hover)]",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
