import { selectionForNumber, type Selection } from "@/data/selections";

export type SelectionGroup<T> = {
  selection: Selection;
  items: T[];
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
