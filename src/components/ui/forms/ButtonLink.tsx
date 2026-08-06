import type { AnchorHTMLAttributes } from "react";
import type { ButtonSize, ButtonVariant } from "@/components/ui/forms/Button";
import { buttonClasses } from "@/components/ui/forms/Button";

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function ButtonLink(props: ButtonLinkProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    ...rest
  } = props;

  return (
    <a
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </a>
  );
}
