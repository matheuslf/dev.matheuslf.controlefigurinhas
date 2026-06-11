"use client";

import * as React from "react";
import { DuplicateBadge } from "@/components/duplicate-badge";
import { SelectionFlag } from "@/components/selection-flag";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  localNumberForGlobal,
  selectionForNumber,
  stickerCount,
} from "@/data/selections";
import { groupNumbersBySelection } from "@/lib/sticker-groups";
import type { StickerState } from "@/lib/sticker-storage";
import { cn } from "@/lib/utils";

type StickerGridGroupedProps = {
  numbers: number[];
  owned: Set<number>;
  getState: (num: number) => StickerState;
  onToggle: (num: number) => void;
  onEditDuplicate: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
  flash: number | null;
};

type StickerCellProps = {
  num: number;
  state: StickerState;
  flash: number | null;
  onToggle: (num: number) => void;
  onEditDuplicate: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
};

function StickerCell({
  num,
  state,
  flash,
  onToggle,
  onEditDuplicate,
}: StickerCellProps) {
  const sel = selectionForNumber(num);
  const clickTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = React.useRef(false);

  if (!sel) return null;

  const isLogo = sel.versoPrefix === "00";
  const local = localNumberForGlobal(sel, num);

  function clearClickTimer() {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
  }

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleClick() {
    clearClickTimer();
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      if (!longPressTriggered.current) onToggle(num);
    }, 280);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    clearClickTimer();
    clearLongPressTimer();
    longPressTriggered.current = false;
    onEditDuplicate(num, e);
  }

  function handleTouchStart(e: React.TouchEvent) {
    longPressTriggered.current = false;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      clearClickTimer();
      onEditDuplicate(num, e);
    }, 500);
  }

  function handleTouchEnd() {
    clearLongPressTimer();
    window.setTimeout(() => {
      longPressTriggered.current = false;
    }, 50);
  }

  React.useEffect(
    () => () => {
      clearClickTimer();
      clearLongPressTimer();
    },
    [],
  );

  return (
    <button
      id={`sticker-${num}`}
      type="button"
      title={`#${num} — duplo clique ou segure para repetidas`}
      onClick={handleClick}
      onContextMenu={(e) => onEditDuplicate(num, e)}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={clearLongPressTimer}
      className={cn(
        "relative flex min-h-16 select-none flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1.5 text-center transition-all duration-150 active:scale-95 touch-manipulation",
        state.owned
          ? "border-success bg-success text-white shadow-[var(--shadow-1)]"
          : "border-border bg-card-muted text-foreground hover:border-primary/50",
        flash === num &&
          "ring-4 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <DuplicateBadge count={state.duplicateCount} />
      {isLogo ? (
        <span className="text-sm font-bold leading-none">00</span>
      ) : (
        <>
          <span className="text-[10px] font-semibold leading-none opacity-80 sm:text-[11px]">
            {sel.versoPrefix}
          </span>
          <span className="text-base font-bold leading-none sm:text-lg">
            {local}
          </span>
        </>
      )}
      <span
        className={cn(
          "text-[9px] font-medium tabular-nums leading-none opacity-60",
          state.owned && "text-white/80",
        )}
      >
        #{num}
      </span>
    </button>
  );
}

export function StickerGridGrouped({
  numbers,
  owned,
  getState,
  onToggle,
  onEditDuplicate,
  flash,
}: StickerGridGroupedProps) {
  const groups = React.useMemo(
    () => groupNumbersBySelection(numbers),
    [numbers],
  );

  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ selection, numbers: groupNums }) => {
        const total = stickerCount(selection);
        const got = groupNums.filter((n) => owned.has(n)).length;
        const pct = total > 0 ? Math.round((got / total) * 1000) / 10 : 0;
        const isCountry = selection.versoPrefix !== "00" && selection.versoPrefix !== "FWC";

        return (
          <section key={selection.id} className="scroll-mt-36">
            <header className="sticky top-14 z-20 -mx-1 mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/95 px-3 py-2.5 backdrop-blur-md sm:top-[4.5rem] sm:px-4">
              <SelectionFlag selection={selection} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">
                    {selection.name}
                  </h3>
                  <Badge variant="secondary" className="tabular-nums">
                    {got}/{total}
                  </Badge>
                </div>
                <p className="text-xs text-muted sm:text-sm">
                  {selection.versoPrefix === "00"
                    ? "Código 00 (foil)"
                    : selection.versoPrefix === "FWC"
                      ? "História da Copa — FWC 1–19"
                      : `${selection.versoPrefix} 1 — ${selection.versoPrefix} ${total}`}
                  {isCountry && (
                    <span className="hidden sm:inline">
                      {" "}
                      · #{selection.startNumber}–{selection.endNumber}
                    </span>
                  )}
                </p>
              </div>
              <div className="hidden w-28 sm:block">
                <Progress value={pct} className="h-2" />
                <p className="mt-1 text-right text-xs tabular-nums text-muted">
                  {pct}%
                </p>
              </div>
            </header>

            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {groupNums.map((num) => (
                <StickerCell
                  key={num}
                  num={num}
                  state={getState(num)}
                  flash={flash}
                  onToggle={onToggle}
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
