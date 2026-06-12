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
  stickerDisplayName,
  type Selection,
} from "@/data/selections";
import { groupNumbersByAlbumHierarchy } from "@/lib/sticker-groups";
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

function selectionSubtitle(selection: Selection): string {
  const total = stickerCount(selection);
  if (selection.versoPrefix === "00") return "Código 00 (foil)";
  if (selection.versoPrefix === "FWC") return "História da Copa — FWC 1–19";
  if (selection.versoPrefix === "LEG") return "LEG 1–16 — Lendas históricas";
  if (selection.versoPrefix === "COC") return "COC 1–14 — Craques Coca-Cola";
  return `${selection.versoPrefix} 1 — ${selection.versoPrefix} ${total}`;
}

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
  const playerName =
    sel.versoPrefix === "COC" ? stickerDisplayName(sel, num) : null;

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
          {playerName && (
            <span className="line-clamp-2 px-0.5 text-[7px] font-medium leading-tight opacity-90 sm:text-[8px]">
              {playerName}
            </span>
          )}
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

function SelectionGridBlock({
  selection,
  groupNums,
  owned,
  getState,
  onToggle,
  onEditDuplicate,
  flash,
}: {
  selection: Selection;
  groupNums: number[];
  owned: Set<number>;
  getState: (num: number) => StickerState;
  onToggle: (num: number) => void;
  onEditDuplicate: (num: number, e: React.MouseEvent | React.TouchEvent) => void;
  flash: number | null;
}) {
  const total = stickerCount(selection);
  const got = groupNums.filter((n) => owned.has(n)).length;
  const pct = total > 0 ? Math.round((got / total) * 1000) / 10 : 0;
  const isCountry =
    selection.albumSection === "teams";

  return (
    <section className="scroll-mt-36">
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
            {selectionSubtitle(selection)}
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
}

export function StickerGridGrouped({
  numbers,
  owned,
  getState,
  onToggle,
  onEditDuplicate,
  flash,
}: StickerGridGroupedProps) {
  const hierarchy = React.useMemo(
    () => groupNumbersByAlbumHierarchy(numbers),
    [numbers],
  );

  return (
    <div className="flex flex-col gap-10">
      {hierarchy.map((section) => (
        <div key={section.sectionId} className="flex flex-col gap-8">
          <h2 className="sticky top-14 z-[15] -mx-1 rounded-lg border border-border bg-background/95 px-3 py-2 text-sm font-bold uppercase tracking-wide text-foreground backdrop-blur-md sm:top-[4.5rem] sm:text-base">
            {section.sectionLabel}
          </h2>
          {section.selections.map(({ selection, numbers: groupNums }) => (
            <SelectionGridBlock
              key={selection.id}
              selection={selection}
              groupNums={groupNums}
              owned={owned}
              getState={getState}
              onToggle={onToggle}
              onEditDuplicate={onEditDuplicate}
              flash={flash}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
