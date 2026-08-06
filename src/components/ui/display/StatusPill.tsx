import { cn } from "@/lib/cn";

/** Lead pipeline stages for the backoffice kanban — matches the Lead.status enum (4 fixed columns). */
export const STATUS = {
  SEM_CONTATO: {
    label: "Sem Contato",
    dot: "bg-cyan-500",
    glow: "shadow-[0_0_8px_var(--color-cyan-500)]",
    ring: "border-cyan-500",
  },
  EM_CONTATO: {
    label: "Em Contato",
    dot: "bg-magenta-500",
    glow: "shadow-[0_0_8px_var(--color-magenta-500)]",
    ring: "border-magenta-500",
  },
  PERDIDO: {
    label: "Perdido",
    dot: "bg-danger",
    glow: "shadow-[0_0_8px_var(--color-danger)]",
    ring: "border-danger",
  },
  FINALIZADO: {
    label: "Finalizado",
    dot: "bg-lime-500",
    glow: "shadow-[0_0_8px_var(--color-lime-500)]",
    ring: "border-lime-500",
  },
};

export type LeadStatus = keyof typeof STATUS;

export type StatusPillProps = {
  status?: LeadStatus;
  className?: string;
};

export function StatusPill(props: StatusPillProps) {
  const { status = "SEM_CONTATO", className } = props;
  const s = STATUS[status] || STATUS.SEM_CONTATO;
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
