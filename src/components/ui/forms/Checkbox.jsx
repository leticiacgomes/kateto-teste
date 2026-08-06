import React from "react";
import { cn } from "@/lib/cn";

export function Checkbox(props) {
  const {
    label,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    id,
    className,
  } = props;
  const generatedId = React.useId();
  const rid = id || generatedId;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const handleChange = (e) => {
    if (disabled) return;
    const next = e.target.checked;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <label
      htmlFor={rid}
      className={cn(
        "inline-flex select-none items-center gap-2.5 font-ui text-body text-fg-body",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0">
        <input
          type="checkbox"
          id={rid}
          checked={on}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            "absolute inset-0 h-full w-full opacity-0",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none flex h-full w-full items-center justify-center rounded-xs border",
            "transition-[background-color,border-color,box-shadow] duration-[140ms] ease-standard",
            on
              ? "border-brand bg-brand shadow-glow-soft"
              : "border-line-strong bg-surface-2",
          )}
        >
          {on && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <title>Marcado</title>
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                stroke="var(--color-brand-contrast)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
