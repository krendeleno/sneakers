export type Neighbors<T> = { prev?: T; next?: T; index: number; total: number };

/** Prev/next pair around `id` in an already ordered list; undefined when the id isn't there. */
export function neighbors<T extends { id: string }>(list: T[], id: string): Neighbors<T> | undefined {
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return undefined;

  return { prev: list[index - 1], next: list[index + 1], index, total: list.length };
}
