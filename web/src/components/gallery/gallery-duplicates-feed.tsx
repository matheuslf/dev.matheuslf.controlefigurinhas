"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { SelectionFlag } from "@/components/selection-flag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatOfficialCode,
  selectionForNumber,
  stickerCount,
} from "@/data/selections";
import type { MemberDuplicate } from "@/app/actions/albums";
import { TradeRequestDialog } from "@/components/gallery/trade-request-dialog";
import { groupBySelection } from "@/lib/sticker-groups";

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

  const groups = React.useMemo(
    () => groupBySelection(othersOnly, (d) => d.stickerNumber),
    [othersOnly],
  );

  if (othersOnly.length === 0) {
    return (
      <p className="py-8 text-center text-muted">
        Nenhuma repetida de outros membros disponível para troca.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {groups.map(({ selection, items }) => {
          const total = stickerCount(selection);
          const uniqueStickers = new Set(items.map((i) => i.stickerNumber)).size;

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
                  {uniqueStickers} {uniqueStickers === 1 ? "repetida" : "repetidas"}
                </Badge>
              </header>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const sel = selectionForNumber(item.stickerNumber);
                  const label = sel
                    ? formatOfficialCode(sel, item.stickerNumber)
                    : `#${item.stickerNumber}`;

                  return (
                    <div
                      key={`${item.userId}-${item.stickerNumber}`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card-muted px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {label}{" "}
                          <span className="font-normal text-muted">
                            ×{item.duplicateCount}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted">{item.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 min-h-0 shrink-0 rounded-lg px-3 text-xs"
                        onClick={() =>
                          setTradeTarget({
                            targetUserId: item.userId,
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
            </section>
          );
        })}
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
