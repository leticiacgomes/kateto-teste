import { cn } from "@/lib/cn";

/** Lead pipeline stages for the backoffice kanban. */
export const STATUS = {
  new: {
    label: "New",
    dot: "bg-cyan-500",
    glow: "shadow-[0_0_8px_var(--color-cyan-500)]",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-magenta-500",
    glow: "shadow-[0_0_8px_var(--color-magenta-500)]",
  },
  negotiating: {
    label: "Negotiating",
    dot: "bg-gold-500",
    glow: "shadow-[0_0_8px_var(--color-gold-500)]",
  },
  won: {
    label: "Won",
    dot: "bg-lime-500",
    glow: "shadow-[0_0_8px_var(--color-lime-500)]",
  },
  lost: {
    label: "Lost",
    dot: "bg-danger",
    glow: "shadow-[0_0_8px_var(--color-danger)]",
  },
};

export function StatusPill(props) {
  const { status = "new", className } = props;
  const s = STATUS[status] || STATUS.new;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full border border-line-subtle bg-surface-2 py-1 pr-2.5 pl-2",
        "font-ui text-caption font-medium leading-none text-fg-body",
        className,
      )}
    >
      <span className={cn("h-[7px] w-[7px] rounded-full", s.dot, s.glow)} />
      {s.label}
    </span>
  );
}
