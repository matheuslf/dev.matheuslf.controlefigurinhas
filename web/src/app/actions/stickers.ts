"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TOTAL_STICKERS } from "@/data/selections";
import {
  isLegacyStickerCollection,
  migrateStickerRows,
} from "@/lib/sticker-number-migration";
import type { StickerState } from "@/lib/sticker-storage";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function rowsToRecord(
  rows: { stickerNumber: number; owned: boolean; duplicateCount: number }[],
): Record<number, StickerState> {
  const out: Record<number, StickerState> = {};
  for (const row of rows) {
    if (row.stickerNumber >= 1 && row.stickerNumber <= TOTAL_STICKERS) {
      out[row.stickerNumber] = {
        owned: row.owned,
        duplicateCount: row.duplicateCount,
      };
    }
  }
  return out;
}

async function maybeMigrateUserStickers(userId: string) {
  const rows = await prisma.userSticker.findMany({ where: { userId } });
  if (rows.length === 0) return rows;

  const stickerRows = rows.map((row) => ({
    stickerNumber: row.stickerNumber,
    owned: row.owned,
    duplicateCount: row.duplicateCount,
  }));

  if (!isLegacyStickerCollection(stickerRows)) return rows;

  const migrated = migrateStickerRows(stickerRows);
  const migratedNums = new Set(migrated.map((r) => r.stickerNumber));
  const oldNums = rows.map((r) => r.stickerNumber);

  await prisma.$transaction([
    ...oldNums
      .filter((n) => !migratedNums.has(n))
      .map((stickerNumber) =>
        prisma.userSticker.deleteMany({ where: { userId, stickerNumber } }),
      ),
    ...migrated.map((row) =>
      prisma.userSticker.upsert({
        where: {
          userId_stickerNumber: { userId, stickerNumber: row.stickerNumber },
        },
        create: {
          userId,
          stickerNumber: row.stickerNumber,
          owned: row.owned,
          duplicateCount: row.duplicateCount,
        },
        update: {
          owned: row.owned,
          duplicateCount: row.duplicateCount,
        },
      }),
    ),
  ]);

  const pendingTrades = await prisma.tradeRequest.findMany({
    where: {
      status: "PENDING",
      stickerNumber: { lte: 980 },
      OR: [{ requesterId: userId }, { targetUserId: userId }],
    },
    select: { id: true, stickerNumber: true },
  });

  const tradeUpdates = pendingTrades
    .map((trade) => {
      const migratedNum = migrateStickerRows([
        {
          stickerNumber: trade.stickerNumber,
          owned: true,
          duplicateCount: 0,
        },
      ])[0]?.stickerNumber;
      if (migratedNum == null || migratedNum === trade.stickerNumber) {
        return null;
      }
      return prisma.tradeRequest.update({
        where: { id: trade.id },
        data: { stickerNumber: migratedNum },
      });
    })
    .filter((op): op is NonNullable<typeof op> => op != null);

  if (tradeUpdates.length > 0) {
    await prisma.$transaction(tradeUpdates);
  }

  return migrated.map((row) => ({
    id: "",
    userId,
    stickerNumber: row.stickerNumber,
    owned: row.owned,
    duplicateCount: row.duplicateCount,
  }));
}

export async function getMyStickers(): Promise<Record<number, StickerState>> {
  const userId = await requireUserId();
  const rows = await maybeMigrateUserStickers(userId);
  return rowsToRecord(rows);
}

export async function upsertStickers(
  batch: {
    stickerNumber: number;
    owned: boolean;
    duplicateCount: number;
  }[],
) {
  const userId = await requireUserId();
  const valid = batch.filter(
    (s) =>
      s.stickerNumber >= 1 &&
      s.stickerNumber <= TOTAL_STICKERS &&
      (s.owned || s.duplicateCount > 0),
  );

  const toDelete = batch.filter(
    (s) =>
      s.stickerNumber >= 1 &&
      s.stickerNumber <= TOTAL_STICKERS &&
      !s.owned &&
      s.duplicateCount === 0,
  );

  const ops = [
    ...valid.map((s) =>
      prisma.userSticker.upsert({
        where: {
          userId_stickerNumber: { userId, stickerNumber: s.stickerNumber },
        },
        create: {
          userId,
          stickerNumber: s.stickerNumber,
          owned: s.owned,
          duplicateCount: s.duplicateCount,
        },
        update: {
          owned: s.owned,
          duplicateCount: s.duplicateCount,
        },
      }),
    ),
    ...toDelete.map((s) =>
      prisma.userSticker.deleteMany({
        where: { userId, stickerNumber: s.stickerNumber },
      }),
    ),
  ];

  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }
}

export async function mergeLocalStickers(
  localData: Record<number, StickerState>,
  strategy: "union" | "local" | "remote",
): Promise<Record<number, StickerState>> {
  const userId = await requireUserId();
  const remote = await getMyStickers();

  const localRows = Object.entries(localData).map(([num, state]) => ({
    stickerNumber: Number(num),
    owned: state.owned,
    duplicateCount: state.duplicateCount,
  }));

  const migratedLocal = isLegacyStickerCollection(localRows)
    ? migrateStickerRows(localRows)
    : localRows;

  const migratedLocalRecord = rowsToRecord(migratedLocal);

  let merged: Record<number, StickerState>;

  if (strategy === "local") {
    merged = migratedLocalRecord;
  } else if (strategy === "remote") {
    merged = remote;
  } else {
    merged = { ...remote };
    for (const [key, state] of Object.entries(migratedLocalRecord)) {
      const num = Number(key);
      const existing = merged[num];
      merged[num] = {
        owned: Boolean(state.owned || existing?.owned),
        duplicateCount: Math.max(
          state.duplicateCount ?? 0,
          existing?.duplicateCount ?? 0,
        ),
      };
    }
  }

  const batch = Object.entries(merged).map(([num, state]) => ({
    stickerNumber: Number(num),
    owned: state.owned,
    duplicateCount: state.duplicateCount,
  }));

  await upsertStickers(batch);
  return merged;
}
