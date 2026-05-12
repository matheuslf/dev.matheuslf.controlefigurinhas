"use client";

import * as React from "react";
import { TOTAL_STICKERS } from "@/data/selections";

/** v2: checklist Panini 2026 (ordem/códigos oficiais no verso) — v1 incompatível. */
const STORAGE_KEY = "figurinhas-copa-2026-owned-v2";

function clampSticker(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_STICKERS;
}

export function useOwnedStickers() {
  const [owned, setOwned] = React.useState<Set<number> | null>(null);

  React.useEffect(() => {
    const next = new Set<number>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as unknown;
        if (Array.isArray(arr)) {
          for (const v of arr) {
            if (typeof v === "number" && clampSticker(v)) next.add(v);
          }
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    // Defer to avoid cascading renders (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setOwned(next);
    });
  }, []);

  const persist = React.useCallback((next: Set<number>) => {
    if (typeof window === "undefined") return;
    const sorted = [...next].filter(clampSticker).sort((a, b) => a - b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  const toggle = React.useCallback(
    (num: number) => {
      if (!clampSticker(num)) return;
      setOwned((prev) => {
        if (prev === null) return prev;
        const next = new Set(prev);
        if (next.has(num)) next.delete(num);
        else next.add(num);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const ready = owned !== null;
  const ownedCount = owned?.size ?? 0;
  const percent = Math.round((ownedCount / TOTAL_STICKERS) * 1000) / 10;

  return { owned: owned ?? new Set<number>(), toggle, ready, ownedCount, percent };
}
