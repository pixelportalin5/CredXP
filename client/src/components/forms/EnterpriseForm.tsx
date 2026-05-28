import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type FormTone = "light" | "dark";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

function FormSection({ title, subtitle, eyebrow, children, className }: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] backdrop-blur sm:p-7",
        className
      )}
    >
      <div className="mb-6 border-b border-slate-100 pb-5">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-500">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface FormFieldProps {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  tone?: FormTone;
  className?: string;
}

function FormField({ label, helper, error, children, tone = "light", className }: FormFieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span
        className={cn(
          "block text-[11px] font-bold uppercase tracking-[0.18em]",
          tone === "dark" ? "text-white/72" : "text-slate-500"
        )}
      >
        {label}
      </span>
      {children}
      {helper && (
        <span className={cn("block text-xs leading-5", tone === "dark" ? "text-white/48" : "text-slate-400")}>
          {helper}
        </span>
      )}
      {error && <span className="block text-xs font-medium text-red-400">{error}</span>}
    </label>
  );
}

const lightControl =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-accent-500/55 focus:ring-4 focus:ring-accent-500/10";

const darkControl =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur transition-all duration-200 placeholder:text-slate-400 hover:border-white/20 hover:bg-white/10 focus:border-accent-300/70 focus:ring-4 focus:ring-accent-500/15";

interface EnterpriseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  tone?: FormTone;
}

const EnterpriseInput = forwardRef<HTMLInputElement, EnterpriseInputProps>(
  ({ tone = "light", className, ...props }, ref) => (
    <input ref={ref} className={cn(tone === "dark" ? darkControl : lightControl, className)} {...props} />
  )
);

EnterpriseInput.displayName = "EnterpriseInput";

interface EnterpriseSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  tone?: FormTone;
  options: { label: string; value: string }[];
  placeholder?: string;
}

const EnterpriseSelect = forwardRef<HTMLSelectElement, EnterpriseSelectProps>(
  ({ tone = "light", options, placeholder, className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        tone === "dark" ? darkControl : lightControl,
        "appearance-none bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-11",
        tone === "dark"
          ? "bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23cbd5e1%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27/%3E%3C/svg%3E\")]"
          : "bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%2364758b%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27/%3E%3C/svg%3E\")]",
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
);

EnterpriseSelect.displayName = "EnterpriseSelect";

interface EnterpriseTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  tone?: FormTone;
}

const EnterpriseTextarea = forwardRef<HTMLTextAreaElement, EnterpriseTextareaProps>(
  ({ tone = "light", className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        tone === "dark" ? darkControl : lightControl,
        "min-h-28 resize-none py-3 leading-6",
        className
      )}
      {...props}
    />
  )
);

EnterpriseTextarea.displayName = "EnterpriseTextarea";

export { EnterpriseInput, EnterpriseSelect, EnterpriseTextarea, FormField, FormSection };
