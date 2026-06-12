import {
  SELECTIONS,
  localNumberForGlobal,
  selectionForNumber,
  type Selection,
} from "@/data/selections";

/** Snapshot da ordem Scanini (980 figurinhas) antes da reordenação por grupos. */
const LEGACY_SECTIONS: readonly { versoPrefix: string; count: number }[] = [
  { versoPrefix: "00", count: 1 },
  { versoPrefix: "FWC", count: 19 },
  { versoPrefix: "ALG", count: 20 },
  { versoPrefix: "ARG", count: 20 },
  { versoPrefix: "AUS", count: 20 },
  { versoPrefix: "AUT", count: 20 },
  { versoPrefix: "BEL", count: 20 },
  { versoPrefix: "BIH", count: 20 },
  { versoPrefix: "BRA", count: 20 },
  { versoPrefix: "CAN", count: 20 },
  { versoPrefix: "CIV", count: 20 },
  { versoPrefix: "COD", count: 20 },
  { versoPrefix: "COL", count: 20 },
  { versoPrefix: "CPV", count: 20 },
  { versoPrefix: "CRO", count: 20 },
  { versoPrefix: "CUW", count: 20 },
  { versoPrefix: "CZE", count: 20 },
  { versoPrefix: "ECU", count: 20 },
  { versoPrefix: "EGY", count: 20 },
  { versoPrefix: "ENG", count: 20 },
  { versoPrefix: "ESP", count: 20 },
  { versoPrefix: "FRA", count: 20 },
  { versoPrefix: "GER", count: 20 },
  { versoPrefix: "GHA", count: 20 },
  { versoPrefix: "HAI", count: 20 },
  { versoPrefix: "IRN", count: 20 },
  { versoPrefix: "IRQ", count: 20 },
  { versoPrefix: "JOR", count: 20 },
  { versoPrefix: "JPN", count: 20 },
  { versoPrefix: "KOR", count: 20 },
  { versoPrefix: "KSA", count: 20 },
  { versoPrefix: "MAR", count: 20 },
  { versoPrefix: "MEX", count: 20 },
  { versoPrefix: "NED", count: 20 },
  { versoPrefix: "NOR", count: 20 },
  { versoPrefix: "NZL", count: 20 },
  { versoPrefix: "PAN", count: 20 },
  { versoPrefix: "PAR", count: 20 },
  { versoPrefix: "POR", count: 20 },
  { versoPrefix: "QAT", count: 20 },
  { versoPrefix: "RSA", count: 20 },
  { versoPrefix: "SCO", count: 20 },
  { versoPrefix: "SEN", count: 20 },
  { versoPrefix: "SUI", count: 20 },
  { versoPrefix: "SWE", count: 20 },
  { versoPrefix: "TUN", count: 20 },
  { versoPrefix: "TUR", count: 20 },
  { versoPrefix: "URU", count: 20 },
  { versoPrefix: "USA", count: 20 },
  { versoPrefix: "UZB", count: 20 },
] as const;

const LEGACY_TOTAL = 980;

const LEGACY_ANCHORS: readonly { legacy: number; next: number }[] = [
  { legacy: 141, next: 181 },
  { legacy: 621, next: 21 },
  { legacy: 41, next: 740 },
];

type LegacyRange = {
  versoPrefix: string;
  startNumber: number;
  endNumber: number;
};

function buildLegacyRanges(): LegacyRange[] {
  let n = 1;
  const out: LegacyRange[] = [];
  for (const s of LEGACY_SECTIONS) {
    out.push({
      versoPrefix: s.versoPrefix,
      startNumber: n,
      endNumber: n + s.count - 1,
    });
    n += s.count;
  }
  return out;
}

const LEGACY_RANGES = buildLegacyRanges();

const LEGACY_GLOBAL_TO_CODE = new Map<number, { prefix: string; local: number }>();

for (const range of LEGACY_RANGES) {
  for (let g = range.startNumber; g <= range.endNumber; g++) {
    LEGACY_GLOBAL_TO_CODE.set(g, {
      prefix: range.versoPrefix,
      local: g - range.startNumber + 1,
    });
  }
}

const NEW_PREFIX_TO_SELECTION = new Map(
  SELECTIONS.map((s) => [s.versoPrefix.toUpperCase(), s]),
);

export function legacySelectionForNumber(
  num: number,
): { prefix: string; local: number } | undefined {
  return LEGACY_GLOBAL_TO_CODE.get(num);
}

export function globalFromVersoCode(
  prefix: string,
  local: number,
): number | null {
  const sel = NEW_PREFIX_TO_SELECTION.get(prefix.toUpperCase());
  if (!sel) return null;
  const max = sel.endNumber - sel.startNumber + 1;
  if (local < 1 || local > max) return null;
  return sel.startNumber + local - 1;
}

/** Remapeia índice global legado (Scanini) para o novo catálogo via código do verso. */
export function migrateStickerNumberFromLegacy(oldGlobal: number): number | null {
  if (oldGlobal > LEGACY_TOTAL) return oldGlobal;

  const legacy = legacySelectionForNumber(oldGlobal);
  if (!legacy) return null;

  return globalFromVersoCode(legacy.prefix, legacy.local);
}

export type StickerRow = {
  stickerNumber: number;
  owned: boolean;
  duplicateCount: number;
};

export function migrateStickerRows(rows: StickerRow[]): StickerRow[] {
  const merged = new Map<number, StickerRow>();

  for (const row of rows) {
    const newNum = migrateStickerNumberFromLegacy(row.stickerNumber);
    if (newNum == null) continue;

    const existing = merged.get(newNum);
    if (!existing) {
      merged.set(newNum, {
        stickerNumber: newNum,
        owned: row.owned,
        duplicateCount: row.duplicateCount,
      });
      continue;
    }

    merged.set(newNum, {
      stickerNumber: newNum,
      owned: existing.owned || row.owned,
      duplicateCount: existing.duplicateCount + row.duplicateCount,
    });
  }

  return [...merged.values()].sort((a, b) => a.stickerNumber - b.stickerNumber);
}

export function isLegacyStickerCollection(rows: StickerRow[]): boolean {
  if (rows.length === 0) return false;
  if (rows.some((r) => r.stickerNumber > LEGACY_TOTAL)) return false;

  const hasData = (n: number) =>
    rows.some(
      (r) =>
        r.stickerNumber === n && (r.owned || r.duplicateCount > 0),
    );

  for (const anchor of LEGACY_ANCHORS) {
    if (hasData(anchor.next)) return false;
    if (hasData(anchor.legacy)) return true;
  }

  return rows.some((r) => r.owned || r.duplicateCount > 0);
}

export function versoCodeForSelection(
  sel: Selection,
  globalNumber: number,
): { prefix: string; local: number } {
  return {
    prefix: sel.versoPrefix,
    local: localNumberForGlobal(sel, globalNumber),
  };
}

export function migrateStickerNumber(num: number): number | null {
  const current = selectionForNumber(num);
  if (current && num > LEGACY_TOTAL) return num;

  const legacy = legacySelectionForNumber(num);
  if (!legacy) return current ? num : null;

  const remapped = globalFromVersoCode(legacy.prefix, legacy.local);
  if (remapped == null) return null;

  if (current) {
    const canonical = globalFromVersoCode(
      current.versoPrefix,
      localNumberForGlobal(current, num),
    );
    if (canonical === num && current.versoPrefix === legacy.prefix) {
      return num;
    }
  }

  return remapped;
}
