import { cn } from "@/lib/cn";

const sizeClasses = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-[13px]",
  lg: "h-12 w-12 text-[17px]",
};

const toneClasses = {
  magenta: "bg-magenta-500/18 text-magenta-500 border-magenta-500/55",
  cyan: "bg-cyan-500/18 text-cyan-500 border-cyan-500/55",
  lime: "bg-lime-500/18 text-lime-500 border-lime-500/55",
  gold: "bg-gold-500/18 text-gold-500 border-gold-500/55",
};

export type AvatarTone = keyof typeof toneClasses;
export type AvatarSize = keyof typeof sizeClasses;

export type AvatarProps = {
  name?: string;
  src?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  className?: string;
};

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

export function Avatar(props: AvatarProps) {
  const { name = "", src, size = "md", tone = "magenta", className } = props;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border",
        "font-mono font-bold",
        src && "border-transparent bg-transparent",
        sizeClasses[size] || sizeClasses.md,
        !src && (toneClasses[tone] || toneClasses.magenta),
        className,
      )}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: <img> is fine here, we don't need next/image for avatars
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
