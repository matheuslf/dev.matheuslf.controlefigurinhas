"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { TOTAL_STICKERS } from "@/data/selections";
import {
  getMyStickers,
  mergeLocalStickers,
  upsertSticker,
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

type SyncStatus = "idle" | "loading" | "saving" | "synced" | "offline";

type StickerCollectionContextValue = {
  collection: StickerCollection;
  owned: Set<number>;
  toggle: (num: number) => void;
  setDuplicateCount: (num: number, count: number) => void;
  replaceCollection: (next: StickerCollection) => void;
  getState: (num: number) => StickerState;
  isStickerPending: (num: number) => boolean;
  ready: boolean;
  ownedCount: number;
  percent: number;
  syncStatus: SyncStatus;
};

const StickerCollectionContext =
  React.createContext<StickerCollectionContextValue | null>(null);

async function fetchCloudStickers(retries = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getMyStickers();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function StickerCollectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const isAuthenticated = status === "authenticated";

  const [collection, setCollection] = React.useState<StickerCollection | null>(
    null,
  );
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>("idle");
  const [pendingStickers, setPendingStickers] = React.useState<Set<number>>(
    () => new Set(),
  );

  const cloudSyncedUserId = React.useRef<string | null>(null);
  const cloudLoadId = React.useRef(0);
  const collectionRef = React.useRef<StickerCollection>(emptyCollection());
  const sessionStatusRef = React.useRef(status);
  const stickerSaveGen = React.useRef<Map<number, number>>(new Map());
  const pendingRef = React.useRef<Set<number>>(new Set());

  sessionStatusRef.current = status;

  const addPending = React.useCallback((nums: Iterable<number>) => {
    for (const num of nums) pendingRef.current.add(num);
    setPendingStickers((prev) => {
      const next = new Set(prev);
      for (const num of nums) next.add(num);
      return next;
    });
  }, []);

  const removePending = React.useCallback((nums: Iterable<number>) => {
    for (const num of nums) pendingRef.current.delete(num);
    setPendingStickers((prev) => {
      const next = new Set(prev);
      for (const num of nums) next.delete(num);
      return next;
    });
  }, []);

  const updateSyncStatus = React.useCallback(() => {
    if (pendingRef.current.size > 0) {
      setSyncStatus("saving");
    } else {
      setSyncStatus("synced");
    }
  }, []);

  const hasUnsyncedChanges = React.useCallback(() => {
    return pendingRef.current.size > 0;
  }, []);

  const saveStickerImmediately = React.useCallback(
    (num: number, state: StickerState) => {
      if (sessionStatusRef.current !== "authenticated") {
        setSyncStatus("offline");
        return;
      }

      const gen = (stickerSaveGen.current.get(num) ?? 0) + 1;
      stickerSaveGen.current.set(num, gen);
      addPending([num]);
      setSyncStatus("saving");

      void upsertSticker(num, state)
        .then(() => {
          if (stickerSaveGen.current.get(num) !== gen) return;
          removePending([num]);
          updateSyncStatus();
        })
        .catch(() => {
          if (stickerSaveGen.current.get(num) !== gen) return;
          removePending([num]);
          setSyncStatus(pendingRef.current.size > 0 ? "saving" : "offline");
        });
    },
    [addPending, removePending, updateSyncStatus],
  );

  const applyCollection = React.useCallback(
    (
      next: StickerCollection,
      options?: { pushToCloud?: boolean; syncStatus?: SyncStatus },
    ) => {
      collectionRef.current = next;
      if (!isAuthenticated) {
        persistToStorage(next);
      }
      setCollection(next);
      if (options?.syncStatus) {
        setSyncStatus(options.syncStatus);
      }
      if (options?.pushToCloud && isAuthenticated) {
        const batch = Array.from(next.entries()).map(([stickerNumber, state]) => ({
          stickerNumber,
          owned: state.owned,
          duplicateCount: state.duplicateCount,
        }));
        if (batch.length === 0) return;

        for (const num of batch.map((item) => item.stickerNumber)) {
          addPending([num]);
        }
        setSyncStatus("saving");

        void upsertStickers(batch)
          .then(() => {
            removePending(batch.map((item) => item.stickerNumber));
            updateSyncStatus();
          })
          .catch(() => {
            removePending(batch.map((item) => item.stickerNumber));
            setSyncStatus("offline");
          });
      }
    },
    [isAuthenticated, addPending, removePending, updateSyncStatus],
  );

  const commitStickerChange = React.useCallback(
    (num: number, state: StickerState) => {
      const next = new Map(collectionRef.current);
      if (!state.owned && state.duplicateCount === 0) {
        next.delete(num);
      } else {
        next.set(num, state);
      }

      collectionRef.current = next;
      setCollection(next);

      if (sessionStatusRef.current !== "authenticated") {
        persistToStorage(next);
        setSyncStatus("offline");
        return;
      }

      saveStickerImmediately(num, state);
    },
    [saveStickerImmediately],
  );

  React.useEffect(() => {
    if (status === "loading") {
      setCollection((prev) => prev ?? loadFromStorage());
      return;
    }

    if (status === "unauthenticated") {
      cloudSyncedUserId.current = null;
      cloudLoadId.current += 1;
      stickerSaveGen.current.clear();
      pendingRef.current.clear();
      setPendingStickers(new Set());
      setCollection(loadFromStorage());
      setSyncStatus("offline");
      return;
    }

    if (!userId) {
      setCollection((prev) => prev ?? emptyCollection());
      return;
    }

    if (cloudSyncedUserId.current === userId) {
      setCollection((prev) => prev ?? emptyCollection());
      return;
    }

    const loadId = ++cloudLoadId.current;
    setSyncStatus("loading");
    setCollection((prev) => prev ?? emptyCollection());

    void (async () => {
      try {
        let remote = await fetchCloudStickers();
        const localLegacy = collectionToPlain(loadFromStorage());

        if (!hasStickerData(remote) && hasStickerData(localLegacy)) {
          await mergeLocalStickers(localLegacy, "local");
          remote = await fetchCloudStickers();
        }

        if (loadId !== cloudLoadId.current) return;

        const cloudCollection = plainToCollection(remote);
        collectionRef.current = cloudCollection;
        setCollection(cloudCollection);
        setSyncStatus("synced");
        cloudSyncedUserId.current = userId;
      } catch {
        if (loadId !== cloudLoadId.current) return;
        collectionRef.current = emptyCollection();
        setCollection(emptyCollection());
        setSyncStatus("offline");
        cloudSyncedUserId.current = userId;
      }
    })();

    return () => {
      cloudLoadId.current += 1;
    };
  }, [status, userId]);

  React.useEffect(() => {
    if (!isAuthenticated || !userId) return;

    function refreshFromCloud() {
      if (hasUnsyncedChanges()) return;
      void getMyStickers()
        .then((remote) => {
          if (hasUnsyncedChanges()) return;
          const cloudCollection = plainToCollection(remote);
          collectionRef.current = cloudCollection;
          setCollection(cloudCollection);
          setSyncStatus("synced");
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
  }, [isAuthenticated, userId, hasUnsyncedChanges]);

  const toggleOwned = React.useCallback(
    (num: number) => {
      if (!clampSticker(num)) return;
      const current =
        collectionRef.current.get(num) ?? { owned: false, duplicateCount: 0 };
      if (current.owned) {
        commitStickerChange(num, { owned: false, duplicateCount: 0 });
      } else {
        commitStickerChange(num, { ...current, owned: true });
      }
    },
    [commitStickerChange],
  );

  const setDuplicateCount = React.useCallback(
    (num: number, duplicateCount: number) => {
      if (!clampSticker(num)) return;
      const count = Math.max(0, Math.floor(duplicateCount));
      const current =
        collectionRef.current.get(num) ?? { owned: false, duplicateCount: 0 };
      commitStickerChange(num, {
        owned: current.owned || count > 0,
        duplicateCount: count,
      });
    },
    [commitStickerChange],
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

  const isStickerPending = React.useCallback(
    (num: number) => pendingStickers.has(num),
    [pendingStickers],
  );

  const value = React.useMemo(
    () => ({
      collection: resolved,
      owned,
      toggle: toggleOwned,
      setDuplicateCount,
      replaceCollection,
      getState,
      isStickerPending,
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
      isStickerPending,
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
