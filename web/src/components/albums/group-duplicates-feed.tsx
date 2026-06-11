"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  formatOfficialCode,
  selectionForNumber,
} from "@/data/selections";
import type { MemberDuplicate } from "@/app/actions/albums";

type GroupDuplicatesFeedProps = {
  duplicates: MemberDuplicate[];
  filterNeededOnly: boolean;
  onFilterChange: (value: boolean) => void;
};

export function GroupDuplicatesFeed({
  duplicates,
  filterNeededOnly,
  onFilterChange,
}: GroupDuplicatesFeedProps) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, MemberDuplicate[]>();
    for (const d of duplicates) {
      const list = map.get(d.userId) ?? [];
      list.push(d);
      map.set(d.userId, list);
    }
    return map;
  }, [duplicates]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filterNeededOnly}
          onChange={(e) => onFilterChange(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Mostrar só repetidas que eu preciso
      </label>

      {duplicates.length === 0 ? (
        <p className="py-8 text-center text-muted">
          Nenhuma repetida de outros membros disponível para troca
          {filterNeededOnly ? " que você ainda não tem" : ""}.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([userId, items]) => (
          <div key={userId} className="rounded-2xl border border-border p-4">
            <p className="mb-3 font-semibold text-foreground">{items[0].name}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const sel = selectionForNumber(item.stickerNumber);
                const label = sel
                  ? formatOfficialCode(sel, item.stickerNumber)
                  : `#${item.stickerNumber}`;
                return (
                  <Badge key={`${userId}-${item.stickerNumber}`} variant="secondary">
                    {label} ×{item.duplicateCount}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
