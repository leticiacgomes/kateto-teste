import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-8 px-3 text-body-sm",
  md: "h-10 px-[18px] text-body",
  lg: "h-12 px-[26px] text-body-lg",
};

const variantClasses = {
  primary:
    "bg-brand text-brand-contrast border border-brand shadow-glow-soft hover:bg-brand-hover hover:shadow-glow-magenta",
  secondary:
    "bg-surface-3 text-fg-strong border border-line-default hover:border-line-strong hover:bg-surface-raised",
  ghost:
    "bg-transparent text-fg-body border border-transparent hover:bg-surface-2",
  outline:
    "bg-transparent text-brand-hover border border-line-accent hover:shadow-glow-soft hover:text-magenta-400",
  danger:
    "bg-transparent text-danger border border-danger-dim hover:bg-danger/8 hover:border-danger",
};

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-ui font-semibold leading-none",
    "transition-[background-color,box-shadow,border-color,transform] duration-[140ms] ease-standard",
    "cursor-pointer active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45",
    fullWidth ? "w-full" : "w-auto",
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    fullWidth = false,
    type = "button",
    onClick,
    className,
    ...rest
  } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
