import { type SelectHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";

export type SelectOption = string | { value: string; label: string };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  wrapClassName?: string;
};

export function Select(props: SelectProps) {
  const {
    label,
    hint,
    error,
    id,
    children,
    options,
    className,
    wrapClassName,
    ...rest
  } = props;
  const generatedId = useId();
  const rid = id || generatedId;

  return (
    <div className={cn("flex flex-col gap-1.5", wrapClassName)}>
      {label && (
        <label
          htmlFor={rid}
          className="font-ui text-caption font-medium uppercase tracking-label text-fg-muted"
        >
          {label}
        </label>
      )}
      <div className="relative flex">
        <select
          id={rid}
          className={cn(
            "h-10 w-full appearance-none rounded-sm border bg-surface-2 px-3 pr-9 font-ui text-body text-fg-strong outline-none",
            "transition-[border-color,box-shadow] duration-[140ms] ease-standard cursor-pointer",
            error
              ? "border-danger"
              : "border-line-default focus:border-brand focus:shadow-glow-soft",
            className,
          )}
          {...rest}
        >
          {options
            ? options.map((o) => {
                const val = typeof o === "string" ? o : o.value;
                const lab = typeof o === "string" ? o : o.label;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })
            : children}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-fg-faint">
          ▾
        </span>
      </div>
      {(hint || error) && (
        <span
          className={cn(
            "font-ui text-caption",
            error ? "text-danger" : "text-fg-faint",
          )}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
