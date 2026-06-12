import { CupSoda, Globe2, Sparkles, Trophy } from "lucide-react";
import type { Selection } from "@/data/selections";
import { getSelectionFlagClass } from "@/data/selection-flags";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

type SelectionFlagProps = {
  selection: Selection;
  size?: keyof typeof sizeMap;
  className?: string;
};

export function SelectionFlag({
  selection,
  size = "md",
  className,
}: SelectionFlagProps) {
  const flagClass = getSelectionFlagClass(selection);

  if (flagClass) {
    return (
      <span
        className={cn(
          "inline-block shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border/60",
          flagClass,
          sizeMap[size],
          className,
        )}
        aria-hidden
      />
    );
  }

  if (selection.versoPrefix === "00") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-border/60",
          size === "sm" && "h-7 w-7",
          size === "md" && "h-9 w-9",
          size === "lg" && "h-11 w-11",
          className,
        )}
        aria-hidden
      >
        <Sparkles className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }

  if (selection.versoPrefix === "FWC") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-accent-secondary/15 text-accent-secondary ring-1 ring-border/60",
          size === "sm" && "h-7 w-7",
          size === "md" && "h-9 w-9",
          size === "lg" && "h-11 w-11",
          className,
        )}
        aria-hidden
      >
        <Globe2 className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }

  if (selection.versoPrefix === "LEG") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-copa-gold-bright/15 text-copa-gold-bright ring-1 ring-border/60",
          size === "sm" && "h-7 w-7",
          size === "md" && "h-9 w-9",
          size === "lg" && "h-11 w-11",
          className,
        )}
        aria-hidden
      >
        <Trophy className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }

  if (selection.versoPrefix === "COC") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive ring-1 ring-border/60",
          size === "sm" && "h-7 w-7",
          size === "md" && "h-9 w-9",
          size === "lg" && "h-11 w-11",
          className,
        )}
        aria-hidden
      >
        <CupSoda className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }

  return null;
}
