"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TOTAL_STICKERS } from "@/data/selections";
import type { StickerState } from "@/lib/sticker-storage";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getMyStickers(): Promise<Record<number, StickerState>> {
  const userId = await requireUserId();
  const rows = await prisma.userSticker.findMany({ where: { userId } });
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

  await prisma.$transaction([
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
  ]);
}

export async function mergeLocalStickers(
  localData: Record<number, StickerState>,
  strategy: "union" | "local" | "remote",
): Promise<Record<number, StickerState>> {
  await requireUserId();
  const remote = await getMyStickers();

  let merged: Record<number, StickerState>;

  if (strategy === "local") {
    merged = localData;
  } else if (strategy === "remote") {
    merged = remote;
  } else {
    merged = { ...remote };
    for (const [key, state] of Object.entries(localData)) {
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
