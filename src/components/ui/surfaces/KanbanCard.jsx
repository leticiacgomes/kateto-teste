import { cn } from "@/lib/cn";
import { Avatar } from "../display/Avatar.jsx";
import { STATUS, StatusPill } from "../display/StatusPill.jsx";

/** A lead card for the backoffice kanban board. */
export function KanbanCard(props) {
  const {
    name,
    handle,
    want,
    value,
    status = "new",
    updated,
    showStatus = false,
    onClick,
    className,
  } = props;
  const s = STATUS[status] || STATUS.new;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-grab flex-col gap-2.5 rounded-md border border-line-subtle bg-surface-2 py-3.5 pr-3.5 pl-4 text-left text-inherit",
        "shadow-sm hover:border-line-strong hover:shadow-md",
        "transition-[border-color,box-shadow] duration-[140ms] ease-standard",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-sm",
          s.dot,
          s.glow,
        )}
      />
      <div className="flex items-center gap-2.5">
        <Avatar name={name} size="sm" />
        <div className="min-w-0">
          <div className="overflow-hidden font-display text-body font-semibold text-ellipsis whitespace-nowrap text-fg-strong leading-[1.1] tracking-heading">
            {name}
          </div>
          {handle && (
            <div className="font-mono text-micro tracking-mono text-fg-faint">
              {handle}
            </div>
          )}
        </div>
      </div>
      {want && (
        <div className="font-ui text-body-sm text-fg-muted leading-normal">
          <span className="text-fg-faint">Wants </span>
          {want}
        </div>
      )}
      <div className="flex items-center justify-between">
        {showStatus ? (
          <StatusPill status={status} />
        ) : (
          value != null && (
            <span className="font-mono text-body-sm font-bold text-fg-body">
              {typeof value === "number" ? `$${value.toLocaleString()}` : value}
            </span>
          )
        )}
        {updated && (
          <span className="font-mono text-micro text-fg-faint">{updated}</span>
        )}
      </div>
    </button>
  );
}
