import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import type { SelectOption } from "@/types/common";

/* ============================================================
   Select — Design System Primitive
   ============================================================ */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-400"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-lg border bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-navy-200",
            "outline-none transition-all duration-200 appearance-none cursor-pointer",
            "border-[var(--border-default)]",
            "focus:border-[var(--border-focus)] focus:ring-1 focus:ring-accent-500/20",
            "hover:border-[var(--border-hover)]",
            // Custom dropdown arrow
            "bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat",
            "bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236b7eaa%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27/%3E%3C/svg%3E\")]",
            "pr-10",
            error && "border-red-500/50",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option key="placeholder" value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };
