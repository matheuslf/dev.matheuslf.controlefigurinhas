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

type PublishedDuplicatesGroupedProps = {
  numbers: number[];
  getDuplicateCount: (num: number) => number;
};

export function PublishedDuplicatesGrouped({
  numbers,
  getDuplicateCount,
}: PublishedDuplicatesGroupedProps) {
  const groups = React.useMemo(
    () => groupNumbersBySelection(numbers),
    [numbers],
  );

  if (numbers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ selection, numbers: groupNums }) => {
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
                  {selection.versoPrefix === "00"
                    ? "Logo Panini"
                    : selection.versoPrefix === "FWC"
                      ? "FWC 1–19"
                      : `${selection.versoPrefix} 1–${total}`}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 tabular-nums text-xs">
                {groupNums.length}{" "}
                {groupNums.length === 1 ? "repetida" : "repetidas"}
                {totalDuplicates > groupNums.length && (
                  <span className="text-muted"> · {totalDuplicates} extras</span>
                )}
              </Badge>
            </header>

            <div className="flex flex-wrap gap-2">
              {groupNums.map((num) => {
                const sel = selectionForNumber(num);
                const label = sel ? formatOfficialCode(sel, num) : `#${num}`;
                const count = getDuplicateCount(num);

                return (
                  <Badge key={num} variant="secondary" className="tabular-nums">
                    {label} ×{count}
                  </Badge>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
