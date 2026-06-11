"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatOfficialCode,
  selectionForNumber,
} from "@/data/selections";
import type { MemberDuplicate } from "@/app/actions/albums";
import { TradeRequestDialog } from "@/components/gallery/trade-request-dialog";

type GalleryDuplicatesFeedProps = {
  albumId: string;
  duplicates: MemberDuplicate[];
};

type TradeTarget = {
  targetUserId: string;
  targetName: string;
  stickerNumber: number;
};

export function GalleryDuplicatesFeed({
  albumId,
  duplicates,
}: GalleryDuplicatesFeedProps) {
  const { data: session } = useSession();
  const [tradeTarget, setTradeTarget] = React.useState<TradeTarget | null>(null);

  const othersOnly = React.useMemo(
    () =>
      duplicates.filter(
        (d) => session?.user?.id == null || d.userId !== session.user.id,
      ),
    [duplicates, session?.user?.id],
  );

  const grouped = React.useMemo(() => {
    const map = new Map<string, MemberDuplicate[]>();
    for (const d of othersOnly) {
      const list = map.get(d.userId) ?? [];
      list.push(d);
      map.set(d.userId, list);
    }
    return map;
  }, [othersOnly]);

  if (othersOnly.length === 0) {
    return (
      <p className="py-8 text-center text-muted">
        Nenhuma repetida de outros membros disponível para troca.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {Array.from(grouped.entries()).map(([userId, items]) => (
          <div key={userId} className="rounded-2xl border border-border p-4">
            <p className="mb-3 font-semibold text-foreground">{items[0].name}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const sel = selectionForNumber(item.stickerNumber);
                const label = sel
                  ? formatOfficialCode(sel, item.stickerNumber)
                  : `#${item.stickerNumber}`;

                return (
                  <div
                    key={`${userId}-${item.stickerNumber}`}
                    className="flex items-center gap-1 rounded-lg border border-border bg-card-muted px-2 py-1"
                  >
                    <Badge variant="secondary">
                      {label} ×{item.duplicateCount}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        setTradeTarget({
                          targetUserId: userId,
                          targetName: item.name,
                          stickerNumber: item.stickerNumber,
                        })
                      }
                    >
                      Trocar
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tradeTarget && (
        <TradeRequestDialog
          albumId={albumId}
          targetUserId={tradeTarget.targetUserId}
          targetName={tradeTarget.targetName}
          stickerNumber={tradeTarget.stickerNumber}
          onClose={() => setTradeTarget(null)}
        />
      )}
    </>
  );
}
