import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "w-[30px] h-[30px]",
  md: "w-[38px] h-[38px]",
  lg: "w-11 h-11",
};

const variantClasses = {
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:bg-surface-2 hover:text-fg-strong",
  solid:
    "bg-surface-3 text-fg-body border border-line-default hover:border-line-strong hover:text-fg-strong",
  accent:
    "bg-brand text-brand-contrast border border-brand hover:bg-brand-hover hover:shadow-glow-magenta",
};

export type IconButtonVariant = keyof typeof variantClasses;
export type IconButtonSize = keyof typeof sizeClasses;

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
};

export function IconButton(props: IconButtonProps) {
  const {
    children,
    label,
    variant = "ghost",
    size = "md",
    disabled = false,
    active = false,
    onClick,
    className,
    ...rest
  } = props;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-sm",
        "transition-[background-color,color,box-shadow,border-color] duration-[140ms] ease-standard",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-45",
        active && "bg-surface-2 text-brand-hover",
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.ghost,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
