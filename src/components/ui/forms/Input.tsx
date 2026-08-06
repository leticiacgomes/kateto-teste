import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  wrapClassName?: string;
};

export function Input(props: InputProps) {
  const {
    label,
    hint,
    error,
    leadingIcon,
    size = "md",
    id,
    className,
    wrapClassName,
    ...rest
  } = props;
  const generatedId = useId();
  const rid = id || generatedId;
  const heightClass =
    size === "sm" ? "h-[34px]" : size === "lg" ? "h-12" : "h-10";

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
      <div
        className={cn(
          "flex items-center gap-2 rounded-sm border bg-surface-2 px-3",
          "transition-[border-color,box-shadow] duration-[140ms] ease-standard",
          error
            ? "border-danger"
            : "border-line-default focus-within:border-brand focus-within:shadow-glow-soft",
          heightClass,
        )}
      >
        {leadingIcon && (
          <span className="flex text-fg-faint">{leadingIcon}</span>
        )}
        <input
          id={rid}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent font-ui text-body text-fg-strong outline-none",
            className,
          )}
          {...rest}
        />
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
