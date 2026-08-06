import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { Avatar } from "../display/Avatar";
import { type LeadStatus, STATUS, StatusPill } from "../display/StatusPill";
import { Tag } from "../display/Tag";

export type LeadCardProps = {
  name?: string;
  handle?: string;
  want?: string;
  value?: number | string;
  status?: LeadStatus;
  updated?: string;
  representative?: string;
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
};

/** A lead card for the backoffice kanban board. */
export function LeadCard(props: LeadCardProps) {
  const {
    name,
    handle,
    want,
    value,
    status = "SEM_CONTATO",
    updated,
    representative,
    showStatus = false,
    onClick,
    className,
  } = props;
  const s = STATUS[status] || STATUS.SEM_CONTATO;

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
        <div className="min-w-0 flex-1">
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
          <span className="text-fg-faint">Quer </span>
          {want}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {showStatus ? (
            <StatusPill status={status} />
          ) : (
            value != null && (
              <span className="shrink-0 font-mono text-body-sm font-bold text-fg-body">
                {typeof value === "number" ? `$${formatPrice(value)}` : value}
              </span>
            )
          )}
          {representative && (
            <Tag className="min-w-0 shrink border-magenta-500/55 bg-magenta-500/18 py-0.5 text-magenta-500">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-micro">
                {representative}
              </span>
            </Tag>
          )}
        </div>
        {updated && (
          <span className="shrink-0 font-mono text-micro text-fg-faint">
            {updated}
          </span>
        )}
      </div>
    </button>
  );
}
