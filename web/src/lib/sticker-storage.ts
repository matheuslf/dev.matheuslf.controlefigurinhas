import { TOTAL_STICKERS } from "@/data/selections";

export type StickerState = {
  owned: boolean;
  duplicateCount: number;
};

export type StickerCollection = Map<number, StickerState>;

const STORAGE_V2 = "figurinhas-copa-2026-owned-v2";
export const STORAGE_V3 = "figurinhas-copa-2026-v3";

type StoredV3 = Record<string, { o?: number; d?: number }>;

export function clampSticker(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_STICKERS;
}

export function emptyCollection(): StickerCollection {
  return new Map();
}

export function loadFromStorage(): StickerCollection {
  if (typeof window === "undefined") return emptyCollection();

  try {
    const v3 = localStorage.getItem(STORAGE_V3);
    if (v3) {
      const parsed = JSON.parse(v3) as StoredV3;
      const map = emptyCollection();
      for (const [key, val] of Object.entries(parsed)) {
        const num = Number(key);
        if (!clampSticker(num)) continue;
        map.set(num, {
          owned: val.o === 1,
          duplicateCount: Math.max(0, val.d ?? 0),
        });
      }
      return map;
    }

    const v2 = localStorage.getItem(STORAGE_V2);
    if (v2) {
      const arr = JSON.parse(v2) as unknown;
      const map = emptyCollection();
      if (Array.isArray(arr)) {
        for (const v of arr) {
          if (typeof v === "number" && clampSticker(v)) {
            map.set(v, { owned: true, duplicateCount: 0 });
          }
        }
      }
      persistToStorage(map);
      return map;
    }
  } catch {
    /* ignore corrupt storage */
  }

  return emptyCollection();
}

export function persistToStorage(collection: StickerCollection) {
  if (typeof window === "undefined") return;
  const obj: StoredV3 = {};
  for (const [num, state] of collection) {
    if (!clampSticker(num)) continue;
    if (!state.owned && state.duplicateCount === 0) continue;
    obj[String(num)] = {
      o: state.owned ? 1 : 0,
      d: state.duplicateCount,
    };
  }
  localStorage.setItem(STORAGE_V3, JSON.stringify(obj));
}

export function hasStickerData(
  data: Record<number, StickerState> | StickerCollection,
): boolean {
  if (data instanceof Map) {
    for (const state of data.values()) {
      if (state.owned || state.duplicateCount > 0) return true;
    }
    return false;
  }
  return Object.values(data).some(
    (state) => state.owned || state.duplicateCount > 0,
  );
}

export function collectionToPlain(
  collection: StickerCollection,
): Record<number, StickerState> {
  const out: Record<number, StickerState> = {};
  for (const [num, state] of collection) {
    out[num] = { ...state };
  }
  return out;
}

export function plainToCollection(
  plain: Record<number, StickerState>,
): StickerCollection {
  const map = emptyCollection();
  for (const [key, state] of Object.entries(plain)) {
    const num = Number(key);
    if (clampSticker(num)) map.set(num, { ...state });
  }
  return map;
}

export function ownedCount(collection: StickerCollection): number {
  let count = 0;
  for (const state of collection.values()) {
    if (state.owned) count++;
  }
  return count;
}

export function duplicatesPublished(collection: StickerCollection): number[] {
  const nums: number[] = [];
  for (const [num, state] of collection) {
    if (state.duplicateCount > 0) nums.push(num);
  }
  return nums.sort((a, b) => a - b);
}

export function mergeCollections(
  local: StickerCollection,
  remote: Record<number, StickerState>,
  strategy: "union" | "local" | "remote",
): StickerCollection {
  if (strategy === "local") return new Map(local);
  if (strategy === "remote") return plainToCollection(remote);

  const merged = emptyCollection();
  const allKeys = new Set([...local.keys(), ...Object.keys(remote).map(Number)]);

  for (const num of allKeys) {
    if (!clampSticker(num)) continue;
    const l = local.get(num);
    const r = remote[num];
    merged.set(num, {
      owned: Boolean(l?.owned || r?.owned),
      duplicateCount: Math.max(l?.duplicateCount ?? 0, r?.duplicateCount ?? 0),
    });
  }
  return merged;
}

export function serializeForSync(collection: StickerCollection) {
  return Array.from(collection.entries()).map(([stickerNumber, state]) => ({
    stickerNumber,
    owned: state.owned,
    duplicateCount: state.duplicateCount,
  }));
}
