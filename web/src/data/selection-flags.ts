import type { Selection } from "@/data/selections";

/** ISO 3166-1 alpha-2 (ou subdivisão suportada pelo flag-icons). */
const SELECTION_FLAG_CODES: Record<string, string> = {
  argelia: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgica: "be",
  "bosnia-herzegovina": "ba",
  brasil: "br",
  canada: "ca",
  "costa-do-marfim": "ci",
  "rd-congo": "cd",
  colombia: "co",
  "cabo-verde": "cv",
  croacia: "hr",
  curacao: "cw",
  chequia: "cz",
  equador: "ec",
  egito: "eg",
  inglaterra: "gb-eng",
  espanha: "es",
  franca: "fr",
  alemanha: "de",
  gana: "gh",
  haiti: "ht",
  ira: "ir",
  iraque: "iq",
  jordania: "jo",
  japao: "jp",
  "coreia-do-sul": "kr",
  "arabia-saudita": "sa",
  marrocos: "ma",
  mexico: "mx",
  holanda: "nl",
  noruega: "no",
  "nova-zelandia": "nz",
  panama: "pa",
  paraguai: "py",
  portugal: "pt",
  catar: "qa",
  "africa-do-sul": "za",
  escocia: "gb-sct",
  senegal: "sn",
  suica: "ch",
  suecia: "se",
  tunisia: "tn",
  turquia: "tr",
  uruguai: "uy",
  "estados-unidos": "us",
  uzbequistao: "uz",
};

export function getSelectionFlagClass(selection: Selection): string | null {
  const code = SELECTION_FLAG_CODES[selection.id];
  if (!code) return null;
  return `fi fi-${code}`;
}

export function selectionHasFlag(selection: Selection): boolean {
  return selection.id in SELECTION_FLAG_CODES;
}
