"use client";

import * as React from "react";
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

type PublishedDuplicatesGroupedProps = {
  numbers: number[];
  getDuplicateCount: (num: number) => number;
};

function selectionSubtitle(selection: Selection): string {
  const total = stickerCount(selection);
  if (selection.versoPrefix === "00") return "Logo Panini";
  if (selection.versoPrefix === "FWC") return "FWC 1–19";
  if (selection.versoPrefix === "LEG") return "LEG 1–16";
  if (selection.versoPrefix === "COC") return "COC 1–14";
  return `${selection.versoPrefix} 1–${total}`;
}

export function PublishedDuplicatesGrouped({
  numbers,
  getDuplicateCount,
}: PublishedDuplicatesGroupedProps) {
  const hierarchy = React.useMemo(
    () => groupNumbersByAlbumHierarchy(numbers),
    [numbers],
  );

  if (numbers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {hierarchy.map((section) => (
        <div key={section.sectionId} className="flex flex-col gap-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground sm:text-base">
            {section.sectionLabel}
          </h2>
          {section.selections.map(({ selection, numbers: groupNums }) => {
            const total = stickerCount(selection);
            const totalDuplicates = groupNums.reduce(
              (sum, num) => sum + getDuplicateCount(num),
              0,
            );

            return (
              <section key={selection.id} className="scroll-mt-32">
                <header className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                  <SelectionFlag selection={selection} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {selection.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {selectionSubtitle(selection)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 tabular-nums text-xs"
                  >
                    {groupNums.length}{" "}
                    {groupNums.length === 1 ? "repetida" : "repetidas"}
                    {totalDuplicates > groupNums.length && (
                      <span className="text-muted">
                        {" "}
                        · {totalDuplicates} extras
                      </span>
                    )}
                  </Badge>
                </header>

                <div className="flex flex-wrap gap-2">
                  {groupNums.map((num) => {
                    const sel = selectionForNumber(num);
                    const label = sel ? formatOfficialCode(sel, num) : `#${num}`;
                    const count = getDuplicateCount(num);
                    const playerName =
                      sel?.versoPrefix === "COC"
                        ? stickerDisplayName(sel, num)
                        : null;

                    return (
                      <Badge
                        key={num}
                        variant="secondary"
                        className="tabular-nums"
                        title={playerName ?? undefined}
                      >
                        {label}
                        {playerName ? ` — ${playerName}` : ""} ×{count}
                      </Badge>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}
