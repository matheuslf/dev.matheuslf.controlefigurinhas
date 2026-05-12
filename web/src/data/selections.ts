/**
 * Álbum oficial Panini — Copa do Mundo 2026 (980 figurinhas).
 *
 * Estrutura alinhada à checklist pública Scanini (códigos do verso, ex. `ARG 10`, `FWC 3`, `00`):
 * https://scanini.app/albums/world-cup-2026
 *
 * Ordem = posição 1–980 no checklist (logo Panini `00`, bloco FWC, depois as 48 seleções na ordem do álbum/Scanini).
 * Confira sempre com o verso das suas figurinhas ou o PDF oficial Panini.
 */
export const TOTAL_STICKERS = 980;

export type Selection = {
  id: string;
  name: string;
  /** Código no verso (ex.: `ARG`, `FWC`, `00` para o logo Panini). */
  versoPrefix: string;
  startNumber: number;
  endNumber: number;
};

type SectionDef = {
  id: string;
  name: string;
  versoPrefix: string;
  count: number;
};

/** Ordem = índice global 1–980 (Scanini / álbum). */
const SECTIONS: readonly SectionDef[] = [
  { id: "logo-panini", name: "Logo Panini", versoPrefix: "00", count: 1 },
  {
    id: "historia-copa",
    name: "História da Copa do Mundo",
    versoPrefix: "FWC",
    count: 19,
  },
  { id: "argelia", name: "Argélia", versoPrefix: "ALG", count: 20 },
  { id: "argentina", name: "Argentina", versoPrefix: "ARG", count: 20 },
  { id: "australia", name: "Austrália", versoPrefix: "AUS", count: 20 },
  { id: "austria", name: "Áustria", versoPrefix: "AUT", count: 20 },
  { id: "belgica", name: "Bélgica", versoPrefix: "BEL", count: 20 },
  {
    id: "bosnia-herzegovina",
    name: "Bósnia e Herzegovina",
    versoPrefix: "BIH",
    count: 20,
  },
  { id: "brasil", name: "Brasil", versoPrefix: "BRA", count: 20 },
  { id: "canada", name: "Canadá", versoPrefix: "CAN", count: 20 },
  { id: "costa-do-marfim", name: "Costa do Marfim", versoPrefix: "CIV", count: 20 },
  { id: "rd-congo", name: "República Democrática do Congo", versoPrefix: "COD", count: 20 },
  { id: "colombia", name: "Colômbia", versoPrefix: "COL", count: 20 },
  { id: "cabo-verde", name: "Cabo Verde", versoPrefix: "CPV", count: 20 },
  { id: "croacia", name: "Croácia", versoPrefix: "CRO", count: 20 },
  { id: "curacao", name: "Curaçao", versoPrefix: "CUW", count: 20 },
  { id: "chequia", name: "Chéquia", versoPrefix: "CZE", count: 20 },
  { id: "equador", name: "Equador", versoPrefix: "ECU", count: 20 },
  { id: "egito", name: "Egito", versoPrefix: "EGY", count: 20 },
  { id: "inglaterra", name: "Inglaterra", versoPrefix: "ENG", count: 20 },
  { id: "espanha", name: "Espanha", versoPrefix: "ESP", count: 20 },
  { id: "franca", name: "França", versoPrefix: "FRA", count: 20 },
  { id: "alemanha", name: "Alemanha", versoPrefix: "GER", count: 20 },
  { id: "gana", name: "Gana", versoPrefix: "GHA", count: 20 },
  { id: "haiti", name: "Haiti", versoPrefix: "HAI", count: 20 },
  { id: "ira", name: "Irã", versoPrefix: "IRN", count: 20 },
  { id: "iraque", name: "Iraque", versoPrefix: "IRQ", count: 20 },
  { id: "jordania", name: "Jordânia", versoPrefix: "JOR", count: 20 },
  { id: "japao", name: "Japão", versoPrefix: "JPN", count: 20 },
  { id: "coreia-do-sul", name: "Coreia do Sul", versoPrefix: "KOR", count: 20 },
  { id: "arabia-saudita", name: "Arábia Saudita", versoPrefix: "KSA", count: 20 },
  { id: "marrocos", name: "Marrocos", versoPrefix: "MAR", count: 20 },
  { id: "mexico", name: "México", versoPrefix: "MEX", count: 20 },
  { id: "holanda", name: "Holanda", versoPrefix: "NED", count: 20 },
  { id: "noruega", name: "Noruega", versoPrefix: "NOR", count: 20 },
  { id: "nova-zelandia", name: "Nova Zelândia", versoPrefix: "NZL", count: 20 },
  { id: "panama", name: "Panamá", versoPrefix: "PAN", count: 20 },
  { id: "paraguai", name: "Paraguai", versoPrefix: "PAR", count: 20 },
  { id: "portugal", name: "Portugal", versoPrefix: "POR", count: 20 },
  { id: "catar", name: "Catar", versoPrefix: "QAT", count: 20 },
  { id: "africa-do-sul", name: "África do Sul", versoPrefix: "RSA", count: 20 },
  { id: "escocia", name: "Escócia", versoPrefix: "SCO", count: 20 },
  { id: "senegal", name: "Senegal", versoPrefix: "SEN", count: 20 },
  { id: "suica", name: "Suíça", versoPrefix: "SUI", count: 20 },
  { id: "suecia", name: "Suécia", versoPrefix: "SWE", count: 20 },
  { id: "tunisia", name: "Tunísia", versoPrefix: "TUN", count: 20 },
  { id: "turquia", name: "Turquia", versoPrefix: "TUR", count: 20 },
  { id: "uruguai", name: "Uruguai", versoPrefix: "URU", count: 20 },
  { id: "estados-unidos", name: "Estados Unidos", versoPrefix: "USA", count: 20 },
  { id: "uzbequistao", name: "Uzbequistão", versoPrefix: "UZB", count: 20 },
] as const;

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

export function selectionForNumber(num: number): Selection | undefined {
  return SELECTIONS.find((s) => num >= s.startNumber && num <= s.endNumber);
}

export function stickersForSelection(sel: Selection): number[] {
  const len = sel.endNumber - sel.startNumber + 1;
  return Array.from({ length: len }, (_, i) => sel.startNumber + i);
}

/** Número local no verso (1–20 nas seleções; 1 no logo `00`; 1–19 em FWC). */
export function localNumberForGlobal(
  sel: Selection,
  globalNumber: number,
): number {
  return globalNumber - sel.startNumber + 1;
}

/** Texto como no verso / Scanini (ex.: `BRA 7`, `FWC 3`, `00`). */
export function formatOfficialCode(
  sel: Selection,
  globalNumber: number,
): string {
  if (sel.versoPrefix === "00") return "00";
  const local = localNumberForGlobal(sel, globalNumber);
  return `${sel.versoPrefix} ${local}`;
}

export function stickerCount(sel: Selection): number {
  return sel.endNumber - sel.startNumber + 1;
}

/**
 * Resolve busca: posição no checklist (1–980), código `00`, ou `FWC 3` / `ARG 10` (espaço opcional).
 */
export function parseStickerQuery(raw: string): number | null {
  const q = raw.trim();
  if (!q) return null;

  if (/^\d{1,3}$/.test(q)) {
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
