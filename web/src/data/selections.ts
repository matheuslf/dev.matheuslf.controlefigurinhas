/**
 * Álbum oficial Panini — Copa do Mundo 2026 (1010 figurinhas).
 *
 * Ordem física do álbum: Logo `00` + FWC → Grupos A–L → LEG 1–16 → COC 1–14.
 * Códigos do verso (ex. `BRA 7`, `LEG 3`, `COC 10`) permanecem como no material Panini.
 */
import {
  cocaColaPlayerForLocal,
  searchCocaColaPlayers,
} from "@/data/coca-cola-players";

export const TOTAL_STICKERS = 1010;

export type AlbumSectionKind = "intro" | "teams" | "legends" | "coca-cola";

export type Selection = {
  id: string;
  name: string;
  /** Código no verso (ex.: `ARG`, `FWC`, `00` para o logo Panini). */
  versoPrefix: string;
  startNumber: number;
  endNumber: number;
  albumSection: AlbumSectionKind;
  /** Grupo A–L; ausente em intro, LEG e COC */
  worldCupGroup?: string;
};

type TeamDef = {
  id: string;
  name: string;
  versoPrefix: string;
};

const TEAMS: Record<string, TeamDef> = {
  MEX: { id: "mexico", name: "México", versoPrefix: "MEX" },
  RSA: { id: "africa-do-sul", name: "África do Sul", versoPrefix: "RSA" },
  KOR: { id: "coreia-do-sul", name: "Coreia do Sul", versoPrefix: "KOR" },
  CZE: { id: "chequia", name: "Chéquia", versoPrefix: "CZE" },
  CAN: { id: "canada", name: "Canadá", versoPrefix: "CAN" },
  BIH: {
    id: "bosnia-herzegovina",
    name: "Bósnia e Herzegovina",
    versoPrefix: "BIH",
  },
  QAT: { id: "catar", name: "Catar", versoPrefix: "QAT" },
  SUI: { id: "suica", name: "Suíça", versoPrefix: "SUI" },
  BRA: { id: "brasil", name: "Brasil", versoPrefix: "BRA" },
  MAR: { id: "marrocos", name: "Marrocos", versoPrefix: "MAR" },
  HAI: { id: "haiti", name: "Haiti", versoPrefix: "HAI" },
  SCO: { id: "escocia", name: "Escócia", versoPrefix: "SCO" },
  USA: { id: "estados-unidos", name: "Estados Unidos", versoPrefix: "USA" },
  PAR: { id: "paraguai", name: "Paraguai", versoPrefix: "PAR" },
  AUS: { id: "australia", name: "Austrália", versoPrefix: "AUS" },
  TUR: { id: "turquia", name: "Turquia", versoPrefix: "TUR" },
  GER: { id: "alemanha", name: "Alemanha", versoPrefix: "GER" },
  CUW: { id: "curacao", name: "Curaçao", versoPrefix: "CUW" },
  CIV: { id: "costa-do-marfim", name: "Costa do Marfim", versoPrefix: "CIV" },
  ECU: { id: "equador", name: "Equador", versoPrefix: "ECU" },
  NED: { id: "holanda", name: "Holanda", versoPrefix: "NED" },
  JPN: { id: "japao", name: "Japão", versoPrefix: "JPN" },
  SWE: { id: "suecia", name: "Suécia", versoPrefix: "SWE" },
  TUN: { id: "tunisia", name: "Tunísia", versoPrefix: "TUN" },
  BEL: { id: "belgica", name: "Bélgica", versoPrefix: "BEL" },
  EGY: { id: "egito", name: "Egito", versoPrefix: "EGY" },
  IRN: { id: "ira", name: "Irã", versoPrefix: "IRN" },
  NZL: { id: "nova-zelandia", name: "Nova Zelândia", versoPrefix: "NZL" },
  ESP: { id: "espanha", name: "Espanha", versoPrefix: "ESP" },
  CPV: { id: "cabo-verde", name: "Cabo Verde", versoPrefix: "CPV" },
  KSA: { id: "arabia-saudita", name: "Arábia Saudita", versoPrefix: "KSA" },
  URU: { id: "uruguai", name: "Uruguai", versoPrefix: "URU" },
  FRA: { id: "franca", name: "França", versoPrefix: "FRA" },
  SEN: { id: "senegal", name: "Senegal", versoPrefix: "SEN" },
  IRQ: { id: "iraque", name: "Iraque", versoPrefix: "IRQ" },
  NOR: { id: "noruega", name: "Noruega", versoPrefix: "NOR" },
  ARG: { id: "argentina", name: "Argentina", versoPrefix: "ARG" },
  ALG: { id: "argelia", name: "Argélia", versoPrefix: "ALG" },
  AUT: { id: "austria", name: "Áustria", versoPrefix: "AUT" },
  JOR: { id: "jordania", name: "Jordânia", versoPrefix: "JOR" },
  POR: { id: "portugal", name: "Portugal", versoPrefix: "POR" },
  COD: {
    id: "rd-congo",
    name: "República Democrática do Congo",
    versoPrefix: "COD",
  },
  UZB: { id: "uzbequistao", name: "Uzbequistão", versoPrefix: "UZB" },
  COL: { id: "colombia", name: "Colômbia", versoPrefix: "COL" },
  ENG: { id: "inglaterra", name: "Inglaterra", versoPrefix: "ENG" },
  CRO: { id: "croacia", name: "Croácia", versoPrefix: "CRO" },
  GHA: { id: "gana", name: "Gana", versoPrefix: "GHA" },
  PAN: { id: "panama", name: "Panamá", versoPrefix: "PAN" },
};

export type WorldCupGroup = {
  id: string;
  name: string;
  letter: string;
  selectionIds: string[];
};

export const WORLD_CUP_GROUPS: readonly WorldCupGroup[] = [
  {
    id: "group-a",
    name: "Grupo A",
    letter: "A",
    selectionIds: ["mexico", "africa-do-sul", "coreia-do-sul", "chequia"],
  },
  {
    id: "group-b",
    name: "Grupo B",
    letter: "B",
    selectionIds: ["canada", "bosnia-herzegovina", "catar", "suica"],
  },
  {
    id: "group-c",
    name: "Grupo C",
    letter: "C",
    selectionIds: ["brasil", "marrocos", "haiti", "escocia"],
  },
  {
    id: "group-d",
    name: "Grupo D",
    letter: "D",
    selectionIds: [
      "estados-unidos",
      "paraguai",
      "australia",
      "turquia",
    ],
  },
  {
    id: "group-e",
    name: "Grupo E",
    letter: "E",
    selectionIds: ["alemanha", "curacao", "costa-do-marfim", "equador"],
  },
  {
    id: "group-f",
    name: "Grupo F",
    letter: "F",
    selectionIds: ["holanda", "japao", "suecia", "tunisia"],
  },
  {
    id: "group-g",
    name: "Grupo G",
    letter: "G",
    selectionIds: ["belgica", "egito", "ira", "nova-zelandia"],
  },
  {
    id: "group-h",
    name: "Grupo H",
    letter: "H",
    selectionIds: ["espanha", "cabo-verde", "arabia-saudita", "uruguai"],
  },
  {
    id: "group-i",
    name: "Grupo I",
    letter: "I",
    selectionIds: ["franca", "senegal", "iraque", "noruega"],
  },
  {
    id: "group-j",
    name: "Grupo J",
    letter: "J",
    selectionIds: ["argentina", "argelia", "austria", "jordania"],
  },
  {
    id: "group-k",
    name: "Grupo K",
    letter: "K",
    selectionIds: [
      "portugal",
      "rd-congo",
      "uzbequistao",
      "colombia",
    ],
  },
  {
    id: "group-l",
    name: "Grupo L",
    letter: "L",
    selectionIds: ["inglaterra", "croacia", "gana", "panama"],
  },
] as const;

const GROUP_PREFIXES: readonly (readonly string[])[] = [
  ["MEX", "RSA", "KOR", "CZE"],
  ["CAN", "BIH", "QAT", "SUI"],
  ["BRA", "MAR", "HAI", "SCO"],
  ["USA", "PAR", "AUS", "TUR"],
  ["GER", "CUW", "CIV", "ECU"],
  ["NED", "JPN", "SWE", "TUN"],
  ["BEL", "EGY", "IRN", "NZL"],
  ["ESP", "CPV", "KSA", "URU"],
  ["FRA", "SEN", "IRQ", "NOR"],
  ["ARG", "ALG", "AUT", "JOR"],
  ["POR", "COD", "UZB", "COL"],
  ["ENG", "CRO", "GHA", "PAN"],
];

type SectionDef = {
  id: string;
  name: string;
  versoPrefix: string;
  count: number;
  albumSection: AlbumSectionKind;
  worldCupGroup?: string;
};

function buildSectionDefs(): SectionDef[] {
  const out: SectionDef[] = [
    {
      id: "logo-panini",
      name: "Logo Panini",
      versoPrefix: "00",
      count: 1,
      albumSection: "intro",
    },
    {
      id: "historia-copa",
      name: "História da Copa do Mundo",
      versoPrefix: "FWC",
      count: 19,
      albumSection: "intro",
    },
  ];

  GROUP_PREFIXES.forEach((prefixes, index) => {
    const group = WORLD_CUP_GROUPS[index];
    for (const prefix of prefixes) {
      const team = TEAMS[prefix];
      out.push({
        id: team.id,
        name: team.name,
        versoPrefix: team.versoPrefix,
        count: 20,
        albumSection: "teams",
        worldCupGroup: group.letter,
      });
    }
  });

  out.push({
    id: "lendas",
    name: "Grandes Campeões e Momentos Históricos",
    versoPrefix: "LEG",
    count: 16,
    albumSection: "legends",
  });

  out.push({
    id: "coca-cola",
    name: "Craques Coca-Cola",
    versoPrefix: "COC",
    count: 14,
    albumSection: "coca-cola",
  });

  return out;
}

const SECTIONS: readonly SectionDef[] = buildSectionDefs();

function buildSelections(): Selection[] {
  let n = 1;
  const out: Selection[] = [];
  for (const s of SECTIONS) {
    out.push({
      id: s.id,
      name: s.name,
      versoPrefix: s.versoPrefix,
      startNumber: n,
      endNumber: n + s.count - 1,
      albumSection: s.albumSection,
      worldCupGroup: s.worldCupGroup,
    });
    n += s.count;
  }
  if (n - 1 !== TOTAL_STICKERS) {
    throw new Error(
      `Sticker range mismatch: expected ${TOTAL_STICKERS}, got ${n - 1}`,
    );
  }
  return out;
}

export const SELECTIONS: readonly Selection[] = buildSelections();

const PREFIX_TO_SELECTION = new Map(
  SELECTIONS.map((s) => [s.versoPrefix.toUpperCase(), s]),
);

const SELECTION_BY_ID = new Map(SELECTIONS.map((s) => [s.id, s]));

export function selectionForNumber(num: number): Selection | undefined {
  return SELECTIONS.find((s) => num >= s.startNumber && num <= s.endNumber);
}

export function stickersForSelection(sel: Selection): number[] {
  const len = sel.endNumber - sel.startNumber + 1;
  return Array.from({ length: len }, (_, i) => sel.startNumber + i);
}

export function worldCupGroupForSelection(sel: Selection): WorldCupGroup | undefined {
  if (!sel.worldCupGroup) return undefined;
  return WORLD_CUP_GROUPS.find((g) => g.letter === sel.worldCupGroup);
}

export function albumSectionForNumber(num: number): AlbumSectionKind | undefined {
  return selectionForNumber(num)?.albumSection;
}

/** Número local no verso (1–20 nas seleções; 1 no logo `00`; 1–19 em FWC). */
export function localNumberForGlobal(
  sel: Selection,
  globalNumber: number,
): number {
  return globalNumber - sel.startNumber + 1;
}

/** Texto como no verso (ex.: `BRA 7`, `FWC 3`, `00`). */
export function formatOfficialCode(
  sel: Selection,
  globalNumber: number,
): string {
  if (sel.versoPrefix === "00") return "00";
  const local = localNumberForGlobal(sel, globalNumber);
  return `${sel.versoPrefix} ${local}`;
}

export function stickerDisplayName(
  sel: Selection,
  globalNumber: number,
): string {
  if (sel.versoPrefix === "COC") {
    const player = cocaColaPlayerForLocal(localNumberForGlobal(sel, globalNumber));
    return player?.name ?? sel.name;
  }
  return sel.name;
}

export function stickerCount(sel: Selection): number {
  return sel.endNumber - sel.startNumber + 1;
}

export type AlbumSectionGroup = {
  sectionId: string;
  sectionLabel: string;
  albumSection: AlbumSectionKind;
  worldCupGroup?: string;
  selectionIds: string[];
};

/** Ordem de exibição: Intro → Grupos A–L → Lendas → Coca-Cola. */
export const ALBUM_SECTION_GROUPS: readonly AlbumSectionGroup[] = [
  {
    sectionId: "intro",
    sectionLabel: "Introdução",
    albumSection: "intro",
    selectionIds: ["logo-panini", "historia-copa"],
  },
  ...WORLD_CUP_GROUPS.map((g) => ({
    sectionId: g.id,
    sectionLabel: g.name,
    albumSection: "teams" as const,
    worldCupGroup: g.letter,
    selectionIds: g.selectionIds,
  })),
  {
    sectionId: "legends",
    sectionLabel: "Lendas históricas",
    albumSection: "legends",
    selectionIds: ["lendas"],
  },
  {
    sectionId: "coca-cola",
    sectionLabel: "Coca-Cola",
    albumSection: "coca-cola",
    selectionIds: ["coca-cola"],
  },
];

export function selectionsForAlbumSection(
  section: AlbumSectionGroup,
): Selection[] {
  return section.selectionIds
    .map((id) => SELECTION_BY_ID.get(id))
    .filter((s): s is Selection => s != null);
}

/**
 * Resolve busca: posição no checklist (1–1010), código `00`, ou `FWC 3` / `ARG 10` (espaço opcional).
 */
export function parseStickerQuery(raw: string): number | null {
  const q = raw.trim();
  if (!q) return null;

  if (/^\d{1,4}$/.test(q)) {
    const n = Number.parseInt(q, 10);
    if (n >= 1 && n <= TOTAL_STICKERS) return n;
    return null;
  }

  const up = q.toUpperCase().replace(/\s+/g, " ");

  if (up === "00") {
    const logo = PREFIX_TO_SELECTION.get("00");
    return logo ? logo.startNumber : null;
  }

  const m = up.match(/^([A-Z]{3})\s*(\d{1,2})$/);
  if (!m) return null;

  const prefix = m[1];
  const local = Number.parseInt(m[2], 10);
  const sel = PREFIX_TO_SELECTION.get(prefix);
  if (!sel) return null;

  const max = stickerCount(sel);
  if (local < 1 || local > max) return null;

  return sel.startNumber + local - 1;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export type AlbumFilterResult = {
  selectionId: string;
  numbers: number[];
  exactSticker: number | null;
};

const ALL_NUMBERS = Array.from({ length: TOTAL_STICKERS }, (_, i) => i + 1);

/**
 * Filtra a listagem por busca parcial: checklist (#42, #4…), código verso (BRA 7) ou país/seleção (BRA, Brasil).
 * Com busca vazia, usa apenas o filtro de seleção do dropdown.
 */
export function resolveAlbumFilter(
  raw: string,
  fallbackSelectionId: string,
): AlbumFilterResult {
  const q = raw.trim();

  if (!q) {
    if (fallbackSelectionId === "all") {
      return { selectionId: "all", numbers: ALL_NUMBERS, exactSticker: null };
    }
    const sel = SELECTIONS.find((s) => s.id === fallbackSelectionId);
    if (!sel) {
      return { selectionId: "all", numbers: ALL_NUMBERS, exactSticker: null };
    }
    return {
      selectionId: sel.id,
      numbers: stickersForSelection(sel),
      exactSticker: null,
    };
  }

  const exact = parseStickerQuery(q);
  if (exact != null) {
    const sel = selectionForNumber(exact)!;
    return {
      selectionId: sel.id,
      numbers: [exact],
      exactSticker: exact,
    };
  }

  if (/^\d+$/.test(q)) {
    const numbers = ALL_NUMBERS.filter((n) => String(n).startsWith(q));
    return { selectionId: "all", numbers, exactSticker: null };
  }

  const up = q.toUpperCase().replace(/\s+/g, " ");
  const normalizedQuery = normalizeText(q);

  const partialCode = up.match(/^([A-Z]{1,3})(?:\s*(\d*))?$/);
  if (partialCode) {
    const [, prefix, numPart] = partialCode;
    const selections = SELECTIONS.filter((s) =>
      s.versoPrefix.startsWith(prefix),
    );
    if (selections.length > 0) {
      let numbers = selections.flatMap((s) => stickersForSelection(s));
      if (numPart) {
        numbers = numbers.filter((n) => {
          const sel = selectionForNumber(n)!;
          return String(localNumberForGlobal(sel, n)).startsWith(numPart);
        });
      }
      return {
        selectionId: selections.length === 1 ? selections[0].id : "all",
        numbers,
        exactSticker: null,
      };
    }
  }

  const cocaLocals = searchCocaColaPlayers(q);
  if (cocaLocals.length > 0) {
    const coc = PREFIX_TO_SELECTION.get("COC")!;
    const numbers = cocaLocals.map((local) => coc.startNumber + local - 1);
    return {
      selectionId: "coca-cola",
      numbers,
      exactSticker: numbers.length === 1 ? numbers[0] : null,
    };
  }

  const matched = SELECTIONS.filter((s) => {
    if (s.versoPrefix.toUpperCase().startsWith(up)) return true;
    return normalizeText(s.name).includes(normalizedQuery);
  });

  if (matched.length > 0) {
    return {
      selectionId: matched.length === 1 ? matched[0].id : "all",
      numbers: matched.flatMap((s) => stickersForSelection(s)),
      exactSticker: null,
    };
  }

  return { selectionId: "all", numbers: [], exactSticker: null };
}
