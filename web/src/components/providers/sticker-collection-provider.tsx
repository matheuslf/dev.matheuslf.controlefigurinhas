"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { TOTAL_STICKERS } from "@/data/selections";
import {
  getMyStickers,
  mergeLocalStickers,
  upsertStickers,
} from "@/app/actions/stickers";
import {
  clampSticker,
  collectionToPlain,
  emptyCollection,
  hasStickerData,
  loadFromStorage,
  ownedCount,
  persistToStorage,
  plainToCollection,
  type StickerCollection,
  type StickerState,
} from "@/lib/sticker-storage";

type StickerCollectionContextValue = {
  collection: StickerCollection;
  owned: Set<number>;
  toggle: (num: number) => void;
  setDuplicateCount: (num: number, count: number) => void;
  replaceCollection: (next: StickerCollection) => void;
  getState: (num: number) => StickerState;
  ready: boolean;
  ownedCount: number;
  percent: number;
  syncStatus: "idle" | "loading" | "saving" | "synced" | "offline";
};

const StickerCollectionContext =
  React.createContext<StickerCollectionContextValue | null>(null);

export function StickerCollectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [collection, setCollection] = React.useState<StickerCollection | null>(
    null,
  );
  const [syncStatus, setSyncStatus] = React.useState<
    "idle" | "loading" | "saving" | "synced" | "offline"
  >("idle");

  const syncTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudUserId = React.useRef<string | null>(null);
  const isSaving = React.useRef(false);

  const scheduleSync = React.useCallback(
    (next: StickerCollection) => {
      if (status !== "authenticated") {
        setSyncStatus("offline");
        return;
      }
      if (syncTimer.current) clearTimeout(syncTimer.current);

      setSyncStatus("saving");
      isSaving.current = true;

      syncTimer.current = setTimeout(async () => {
        try {
          await upsertStickers(
            Array.from(next.entries()).map(([stickerNumber, state]) => ({
              stickerNumber,
              owned: state.owned,
              duplicateCount: state.duplicateCount,
            })),
          );
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        } finally {
          isSaving.current = false;
        }
      }, 500);
    },
    [status],
  );

  const applyCollection = React.useCallback(
    (
      next: StickerCollection,
      options?: { pushToCloud?: boolean; syncStatus?: typeof syncStatus },
    ) => {
      persistToStorage(next);
      setCollection(next);
      if (options?.syncStatus) {
        setSyncStatus(options.syncStatus);
      }
      if (options?.pushToCloud) {
        scheduleSync(next);
      }
    },
    [scheduleSync],
  );

  const loadFromCloud = React.useCallback(async () => {
    setSyncStatus("loading");
    try {
      let remote = await getMyStickers();

      const localLegacy = collectionToPlain(loadFromStorage());
      if (!hasStickerData(remote) && hasStickerData(localLegacy)) {
        await mergeLocalStickers(localLegacy, "local");
        remote = await getMyStickers();
      }

      applyCollection(plainToCollection(remote), { syncStatus: "synced" });
    } catch {
      applyCollection(loadFromStorage(), { syncStatus: "offline" });
    }
  }, [applyCollection]);

  React.useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      cloudUserId.current = null;
      setCollection(loadFromStorage());
      setSyncStatus("offline");
      return;
    }

    if (status === "authenticated" && userId && cloudUserId.current !== userId) {
      cloudUserId.current = userId;
      setCollection(null);
      void loadFromCloud();
    }
  }, [status, userId, loadFromCloud]);

  React.useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    function refreshFromCloud() {
      if (isSaving.current) return;
      void getMyStickers()
        .then((remote) => {
          applyCollection(plainToCollection(remote), { syncStatus: "synced" });
        })
        .catch(() => setSyncStatus("offline"));
    }

    function onVisible() {
      if (document.visibilityState === "visible") refreshFromCloud();
    }

    window.addEventListener("focus", refreshFromCloud);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refreshFromCloud);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, userId, applyCollection]);

  const update = React.useCallback(
    (updater: (prev: StickerCollection) => StickerCollection) => {
      setCollection((prev) => {
        if (prev === null) return prev;
        const next = updater(new Map(prev));
        applyCollection(next, { pushToCloud: true });
        return next;
      });
    },
    [applyCollection],
  );

  const toggleOwned = React.useCallback(
    (num: number) => {
      if (!clampSticker(num)) return;
      update((prev) => {
        const current = prev.get(num) ?? { owned: false, duplicateCount: 0 };
        const next = new Map(prev);
        if (current.owned) {
          next.set(num, { owned: false, duplicateCount: 0 });
        } else {
          next.set(num, { ...current, owned: true });
        }
        return next;
      });
    },
    [update],
  );

  const setDuplicateCount = React.useCallback(
    (num: number, duplicateCount: number) => {
      if (!clampSticker(num)) return;
      const count = Math.max(0, Math.floor(duplicateCount));
      update((prev) => {
        const current = prev.get(num) ?? { owned: false, duplicateCount: 0 };
        const next = new Map(prev);
        next.set(num, {
          owned: current.owned || count > 0,
          duplicateCount: count,
        });
        return next;
      });
    },
    [update],
  );

  const replaceCollection = React.useCallback(
    (next: StickerCollection) => {
      applyCollection(next, { pushToCloud: true });
    },
    [applyCollection],
  );

  const ready = collection !== null;
  const resolved = collection ?? emptyCollection();

  const owned = React.useMemo(() => {
    const set = new Set<number>();
    for (const [num, state] of resolved) {
      if (state.owned) set.add(num);
    }
    return set;
  }, [resolved]);

  const count = ownedCount(resolved);
  const percent = Math.round((count / TOTAL_STICKERS) * 1000) / 10;

  const getState = React.useCallback(
    (num: number): StickerState => {
      return resolved.get(num) ?? { owned: false, duplicateCount: 0 };
    },
    [resolved],
  );

  const value = React.useMemo(
    () => ({
      collection: resolved,
      owned,
      toggle: toggleOwned,
      setDuplicateCount,
      replaceCollection,
      getState,
      ready,
      ownedCount: count,
      percent,
      syncStatus,
    }),
    [
      resolved,
      owned,
      toggleOwned,
      setDuplicateCount,
      replaceCollection,
      getState,
      ready,
      count,
      percent,
      syncStatus,
    ],
  );

  return (
    <StickerCollectionContext.Provider value={value}>
      {children}
    </StickerCollectionContext.Provider>
  );
}

export function useStickerCollection() {
  const ctx = React.useContext(StickerCollectionContext);
  if (!ctx) {
    throw new Error(
      "useStickerCollection must be used within StickerCollectionProvider",
    );
  }
  return ctx;
}
