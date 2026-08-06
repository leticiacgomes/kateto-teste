import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TagProps = {
  children?: ReactNode;
  onRemove?: () => void;
  removable?: boolean;
  className?: string;
};

export function Tag(props: TagProps) {
  const { children, onRemove, removable = false, className } = props;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-line-default bg-surface-3 px-2.5 py-1",
        "font-ui text-body-sm text-fg-body leading-none",
        className,
      )}
    >
      {children}
      {removable && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          className="inline-flex cursor-pointer border-none bg-transparent p-0 font-mono text-[13px] leading-none text-fg-faint hover:text-danger"
        >
          ×
        </button>
      )}
    </span>
  );
}
