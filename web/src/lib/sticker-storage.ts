import { TOTAL_STICKERS } from "@/data/selections";
import {
  isLegacyStickerCollection,
  migrateStickerRows,
} from "@/lib/sticker-number-migration";

export type StickerState = {
  owned: boolean;
  duplicateCount: number;
};

export type StickerCollection = Map<number, StickerState>;

const STORAGE_V2 = "figurinhas-copa-2026-owned-v2";
export const STORAGE_V3 = "figurinhas-copa-2026-v3";
export const STORAGE_V4 = "figurinhas-copa-2026-v4";

type StoredV3 = Record<string, { o?: number; d?: number }>;

export function clampSticker(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_STICKERS;
}

export function emptyCollection(): StickerCollection {
  return new Map();
}

function parseStoredCollection(raw: StoredV3): StickerCollection {
  const map = emptyCollection();
  for (const [key, val] of Object.entries(raw)) {
    const num = Number(key);
    if (!Number.isInteger(num)) continue;
    map.set(num, {
      owned: val.o === 1,
      duplicateCount: Math.max(0, val.d ?? 0),
    });
  }
  return map;
}

function migrateStoredCollection(map: StickerCollection): StickerCollection {
  const rows = [...map.entries()].map(([stickerNumber, state]) => ({
    stickerNumber,
    owned: state.owned,
    duplicateCount: state.duplicateCount,
  }));

  if (!isLegacyStickerCollection(rows)) {
    const out = emptyCollection();
    for (const [num, state] of map) {
      if (clampSticker(num)) out.set(num, state);
    }
    return out;
  }

  const migrated = migrateStickerRows(rows);
  const out = emptyCollection();
  for (const row of migrated) {
    if (!clampSticker(row.stickerNumber)) continue;
    out.set(row.stickerNumber, {
      owned: row.owned,
      duplicateCount: row.duplicateCount,
    });
  }
  return out;
}

export function loadFromStorage(): StickerCollection {
  if (typeof window === "undefined") return emptyCollection();

  try {
    const v4 = localStorage.getItem(STORAGE_V4);
    if (v4) {
      const parsed = JSON.parse(v4) as StoredV3;
      return parseStoredCollection(parsed);
    }

    const v3 = localStorage.getItem(STORAGE_V3);
    if (v3) {
      const parsed = JSON.parse(v3) as StoredV3;
      const migrated = migrateStoredCollection(parseStoredCollection(parsed));
      persistToStorage(migrated);
      localStorage.removeItem(STORAGE_V3);
      return migrated;
    }

    const v2 = localStorage.getItem(STORAGE_V2);
    if (v2) {
      const arr = JSON.parse(v2) as unknown;
      const map = emptyCollection();
      if (Array.isArray(arr)) {
        for (const v of arr) {
          if (typeof v === "number") {
            map.set(v, { owned: true, duplicateCount: 0 });
          }
        }
      }
      const migrated = migrateStoredCollection(map);
      persistToStorage(migrated);
      localStorage.removeItem(STORAGE_V2);
      return migrated;
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
  localStorage.setItem(STORAGE_V4, JSON.stringify(obj));
  localStorage.removeItem(STORAGE_V3);
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
