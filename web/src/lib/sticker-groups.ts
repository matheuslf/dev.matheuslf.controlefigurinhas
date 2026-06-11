import { selectionForNumber, type Selection } from "@/data/selections";

export function groupNumbersBySelection(numbers: number[]) {
  const groups: { selection: Selection; numbers: number[] }[] = [];
  let current: { selection: Selection; numbers: number[] } | null = null;

  for (const num of numbers) {
    const sel = selectionForNumber(num);
    if (!sel) continue;
    if (current?.selection.id === sel.id) {
      current.numbers.push(num);
    } else {
      if (current) groups.push(current);
      current = { selection: sel, numbers: [num] };
    }
  }
  if (current) groups.push(current);
  return groups;
}
