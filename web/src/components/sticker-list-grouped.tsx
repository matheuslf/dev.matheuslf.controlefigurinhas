"use client";

import * as React from "react";
import { SelectionFlag } from "@/components/selection-flag";
import { Badge } from "@/components/ui/badge";
import {
  formatOfficialCode,
  selectionForNumber,
  stickerCount,
} from "@/data/selections";
import { groupNumbersBySelection } from "@/lib/sticker-groups";
import type { StickerState } from "@/lib/sticker-storage";
import { cn } from "@/lib/utils";

type StickerListGroupedProps = {
  numbers: number[];
  owned: Set<number>;
  getState: (num: number) => StickerState;
  onEditDuplicate?: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
};

function BrowseChip({
  num,
  state,
  onEditDuplicate,
}: {
  num: number;
  state: StickerState;
  onEditDuplicate?: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
}) {
  const sel = selectionForNumber(num);
  if (!sel) return null;

  const isLogo = sel.versoPrefix === "00";
  const label = isLogo ? "00" : formatOfficialCode(sel, num);

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
        "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center",
        onEditDuplicate && "cursor-pointer active:scale-[0.98]",
        state.owned
          ? "border-success/40 bg-success/10 text-foreground"
          : "border-border bg-card text-muted",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold leading-none sm:text-sm",
          state.owned && "text-success",
        )}
      >
        {label}
      </span>
      <span className="text-[9px] tabular-nums leading-none opacity-60">
        #{num}
        {state.duplicateCount > 0 && ` · +${state.duplicateCount}`}
      </span>
    </div>
  );
}

export function StickerListGrouped({
  numbers,
  owned,
  getState,
  onEditDuplicate,
}: StickerListGroupedProps) {
  const groups = React.useMemo(
    () => groupNumbersBySelection(numbers),
    [numbers],
  );

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ selection, numbers: groupNums }) => {
        const total = stickerCount(selection);
        const got = groupNums.filter((n) => owned.has(n)).length;
        const missing = total - got;

        return (
          <section key={selection.id} className="scroll-mt-32">
            <header className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
              <SelectionFlag selection={selection} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {selection.name}
                </h3>
                <p className="text-xs text-muted">
                  {selection.versoPrefix === "00"
                    ? "Logo Panini"
                    : selection.versoPrefix === "FWC"
                      ? "FWC 1–19"
                      : `${selection.versoPrefix} 1–${total}`}
                </p>
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
                  onEditDuplicate={onEditDuplicate}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
