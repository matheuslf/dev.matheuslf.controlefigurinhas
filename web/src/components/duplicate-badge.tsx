import { cn } from "@/lib/utils";

export function DuplicateBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-copa-gold-bright px-1 text-[10px] font-bold text-neutral-900 dark:text-black shadow-sm",
        className,
      )}
    >
      +{count}
    </span>
  );
}
