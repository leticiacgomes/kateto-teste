import { type TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapClassName?: string;
};

export function Textarea(props: TextareaProps) {
  const {
    label,
    hint,
    error,
    id,
    rows = 4,
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
      <textarea
        id={rid}
        rows={rows}
        className={cn(
          "resize-y rounded-sm border bg-surface-2 px-3 py-2.5 font-ui text-body text-fg-strong leading-normal outline-none",
          "transition-[border-color,box-shadow] duration-[140ms] ease-standard",
          error
            ? "border-danger"
            : "border-line-default focus:border-brand focus:shadow-glow-soft",
          className,
        )}
        {...rest}
      />
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
