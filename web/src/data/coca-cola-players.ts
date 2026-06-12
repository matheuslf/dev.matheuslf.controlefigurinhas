export type CocaColaPlayer = {
  localNumber: number;
  name: string;
  position: string;
};

/** Craques Coca-Cola — COC 1 a COC 14. */
export const COCA_COLA_PLAYERS: readonly CocaColaPlayer[] = [
  { localNumber: 1, name: 'Emiliano "Dibu" Martínez', position: "Goleiro" },
  { localNumber: 2, name: "Gabriel Magalhães", position: "Defensor" },
  { localNumber: 3, name: "Virgil van Dijk", position: "Defensor" },
  { localNumber: 4, name: "Joško Gvardiol", position: "Defensor" },
  { localNumber: 5, name: "Alphonso Davies", position: "Defensor" },
  { localNumber: 6, name: "Joshua Kimmich", position: "Meio-campista" },
  { localNumber: 7, name: "Federico Valverde", position: "Meio-campista" },
  { localNumber: 8, name: "Jefferson Lerma", position: "Meio-campista" },
  { localNumber: 9, name: "Lamine Yamal", position: "Atacante" },
  { localNumber: 10, name: "Harry Kane", position: "Atacante" },
  { localNumber: 11, name: "Lautaro Martínez", position: "Atacante" },
  { localNumber: 12, name: "Santiago Giménez", position: "Atacante" },
  { localNumber: 13, name: "Raúl Jiménez", position: "Atacante" },
  { localNumber: 14, name: "Enner Valencia", position: "Atacante" },
] as const;

const BY_LOCAL = new Map(
  COCA_COLA_PLAYERS.map((p) => [p.localNumber, p]),
);

export function cocaColaPlayerForLocal(localNumber: number): CocaColaPlayer | undefined {
  return BY_LOCAL.get(localNumber);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function searchCocaColaPlayers(query: string): number[] {
  const q = normalizeText(query.trim());
  if (!q) return [];
  return COCA_COLA_PLAYERS.filter((p) => normalizeText(p.name).includes(q)).map(
    (p) => p.localNumber,
  );
}
