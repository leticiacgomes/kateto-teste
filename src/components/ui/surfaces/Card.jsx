import { cn } from "@/lib/cn";

export function Card(props) {
  const {
    children,
    interactive = false,
    glow = false,
    onClick,
    className,
  } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg border border-line-subtle bg-surface-1 p-6 text-left text-inherit",
        "shadow-md hover:border-line-strong",
        "transition-[border-color,box-shadow,transform] duration-[140ms] ease-standard",
        interactive
          ? "cursor-pointer hover:-translate-y-0.5"
          : "cursor-default",
        glow && "hover:shadow-glow-soft",
        className,
      )}
    >
      {children}
    </button>
  );
}
