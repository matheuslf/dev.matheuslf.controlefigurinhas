"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { SelectionFlag } from "@/components/selection-flag";
import { Badge } from "@/components/ui/badge";
import {
  formatOfficialCode,
  selectionForNumber,
  stickerCount,
  stickerDisplayName,
  type Selection,
} from "@/data/selections";
import { groupNumbersByAlbumHierarchy } from "@/lib/sticker-groups";
import type { StickerState } from "@/lib/sticker-storage";
import { cn } from "@/lib/utils";

type StickerListGroupedProps = {
  numbers: number[];
  owned: Set<number>;
  getState: (num: number) => StickerState;
  isStickerPending?: (num: number) => boolean;
  onEditDuplicate?: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
};

function selectionSubtitle(selection: Selection): string {
  const total = stickerCount(selection);
  if (selection.versoPrefix === "00") return "Logo Panini";
  if (selection.versoPrefix === "FWC") return "FWC 1–19";
  if (selection.versoPrefix === "LEG") return "LEG 1–16";
  if (selection.versoPrefix === "COC") return "COC 1–14";
  return `${selection.versoPrefix} 1–${total}`;
}

function BrowseChip({
  num,
  state,
  pending,
  onEditDuplicate,
}: {
  num: number;
  state: StickerState;
  pending: boolean;
  onEditDuplicate?: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
}) {
  const sel = selectionForNumber(num);
  if (!sel) return null;

  const isLogo = sel.versoPrefix === "00";
  const label = isLogo ? "00" : formatOfficialCode(sel, num);
  const playerName =
    sel.versoPrefix === "COC" ? stickerDisplayName(sel, num) : null;

  return (
    <div
      id={`list-sticker-${num}`}
      role={onEditDuplicate ? "button" : undefined}
      tabIndex={onEditDuplicate ? 0 : undefined}
      onDoubleClick={
        onEditDuplicate
          ? (e) => onEditDuplicate(num, e)
          : undefined
      }
      className={cn(
        "relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center",
        onEditDuplicate && !pending && "cursor-pointer active:scale-[0.98]",
        pending && "opacity-80",
        state.owned
          ? "border-success/40 bg-success/10 text-foreground"
          : "border-border bg-card text-muted",
      )}
    >
      {pending && (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50"
          aria-hidden
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </span>
      )}
      <span
        className={cn(
          "text-xs font-bold leading-none sm:text-sm",
          state.owned && "text-success",
        )}
      >
        {label}
      </span>
      {playerName && (
        <span className="line-clamp-2 text-[8px] leading-tight opacity-80 sm:text-[9px]">
          {playerName}
        </span>
      )}
      <span className="text-[9px] tabular-nums leading-none opacity-60">
        #{num}
        {state.duplicateCount > 0 && ` · +${state.duplicateCount}`}
      </span>
    </div>
  );
}

function SelectionBlock({
  selection,
  groupNums,
  owned,
  getState,
  isStickerPending,
  onEditDuplicate,
}: {
  selection: Selection;
  groupNums: number[];
  owned: Set<number>;
  getState: (num: number) => StickerState;
  isStickerPending?: (num: number) => boolean;
  onEditDuplicate?: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
}) {
  const total = stickerCount(selection);
  const got = groupNums.filter((n) => owned.has(n)).length;
  const missing = total - got;

  return (
    <section className="scroll-mt-32">
      <header className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
        <SelectionFlag selection={selection} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
            {selection.name}
          </h3>
          <p className="text-xs text-muted">{selectionSubtitle(selection)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="secondary" className="tabular-nums text-xs">
            {got}/{total}
          </Badge>
          {missing > 0 && (
            <span className="text-[11px] text-muted">faltam {missing}</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 lg:grid-cols-10">
        {groupNums.map((num) => (
          <BrowseChip
            key={num}
            num={num}
            state={getState(num)}
            pending={isStickerPending?.(num) ?? false}
            onEditDuplicate={onEditDuplicate}
          />
        ))}
      </div>
    </section>
  );
}

export function StickerListGrouped({
  numbers,
  owned,
  getState,
  isStickerPending,
  onEditDuplicate,
}: StickerListGroupedProps) {
  const hierarchy = React.useMemo(
    () => groupNumbersByAlbumHierarchy(numbers),
    [numbers],
  );

  return (
    <div className="flex flex-col gap-8">
      {hierarchy.map((section) => (
        <div key={section.sectionId} className="flex flex-col gap-6">
          <h2 className="sticky top-14 z-10 -mx-1 rounded-lg border border-border bg-background/95 px-3 py-2 text-sm font-bold uppercase tracking-wide text-foreground backdrop-blur-md sm:top-[4.5rem] sm:text-base">
            {section.sectionLabel}
          </h2>
          {section.selections.map(({ selection, numbers: groupNums }) => (
            <SelectionBlock
              key={selection.id}
              selection={selection}
              groupNums={groupNums}
              owned={owned}
              getState={getState}
              isStickerPending={isStickerPending}
              onEditDuplicate={onEditDuplicate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
