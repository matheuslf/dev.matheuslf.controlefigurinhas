import {
  ALBUM_SECTION_GROUPS,
  SELECTIONS,
  selectionForNumber,
  type Selection,
} from "@/data/selections";

export type SelectionGroup<T> = {
  selection: Selection;
  items: T[];
};

export type AlbumHierarchyGroup = {
  sectionId: string;
  sectionLabel: string;
  worldCupGroup?: string;
  selections: { selection: Selection; numbers: number[] }[];
};

export function groupBySelection<T>(
  items: readonly T[],
  getNumber: (item: T) => number,
): SelectionGroup<T>[] {
  const sorted = [...items].sort((a, b) => getNumber(a) - getNumber(b));
  const groups: SelectionGroup<T>[] = [];
  let current: SelectionGroup<T> | null = null;

  for (const item of sorted) {
    const sel = selectionForNumber(getNumber(item));
    if (!sel) continue;
    if (current?.selection.id === sel.id) {
      current.items.push(item);
    } else {
      if (current) groups.push(current);
      current = { selection: sel, items: [item] };
    }
  }
  if (current) groups.push(current);
  return groups;
}

export function groupNumbersBySelection(numbers: number[]) {
  return groupBySelection(numbers, (num) => num).map(({ selection, items }) => ({
    selection,
    numbers: items,
  }));
}

export function groupNumbersByAlbumHierarchy(
  numbers: number[],
): AlbumHierarchyGroup[] {
  const sorted = [...numbers].sort((a, b) => a - b);
  const numberSet = new Set(sorted);
  if (numberSet.size === 0) return [];

  const selectionById = new Map(SELECTIONS.map((s) => [s.id, s]));
  const groups: AlbumHierarchyGroup[] = [];

  for (const section of ALBUM_SECTION_GROUPS) {
    const selections: { selection: Selection; numbers: number[] }[] = [];

    for (const selectionId of section.selectionIds) {
      const selection = selectionById.get(selectionId);
      if (!selection) continue;

      const sectionNumbers = sorted.filter(
        (n) => n >= selection.startNumber && n <= selection.endNumber,
      );
      if (sectionNumbers.length === 0) continue;

      selections.push({ selection, numbers: sectionNumbers });
    }

    if (selections.length === 0) continue;

    groups.push({
      sectionId: section.sectionId,
      sectionLabel: section.sectionLabel,
      worldCupGroup: section.worldCupGroup,
      selections,
    });
  }

  return groups;
}
