import type { ScreenFrame } from '@/types';

const storageKey = (fileKey: string) => `figview:screen-order:${fileKey}`;

export function readStoredScreenOrder(fileKey: string): string[] | null {
  try {
    const raw = localStorage.getItem(storageKey(fileKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((x): x is string => typeof x === 'string')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredScreenOrder(fileKey: string, ids: string[]): void {
  try {
    localStorage.setItem(storageKey(fileKey), JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

/** Merge a preferred id list with current screens: keep known order, append new frames. */
export function mergeOrderWithScreens(order: string[] | null | undefined, screens: ScreenFrame[]): string[] {
  const byId = new Map(screens.map(s => [s.id, s]));
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of order ?? []) {
    if (byId.has(id) && !seen.has(id)) {
      next.push(id);
      seen.add(id);
    }
  }
  for (const s of screens) {
    if (!seen.has(s.id)) next.push(s.id);
  }
  return next;
}

export function sortScreensByOrder(screens: ScreenFrame[], order: string[]): ScreenFrame[] {
  const map = new Map(screens.map(s => [s.id, s]));
  const out: ScreenFrame[] = [];
  for (const id of order) {
    const s = map.get(id);
    if (s) out.push(s);
  }
  return out;
}

/**
 * Reorder ids that appear in `filteredOrderedIds` (in current visual order) after moving
 * the item at `from` to index `to`. Other ids in `globalOrder` stay in place.
 */
/** Move item at `from` to index `to` (same array length). */
export function moveIndexInArray<T>(arr: T[], from: number, to: number): T[] {
  const len = arr.length;
  if (len === 0) return arr;
  const f = Math.max(0, Math.min(from, len - 1));
  const t = Math.max(0, Math.min(to, len - 1));
  if (f === t) return [...arr];
  const next = [...arr];
  const [item] = next.splice(f, 1);
  next.splice(t, 0, item);
  return next;
}

export function reorderGlobalFromFilteredMove(
  globalOrder: string[],
  filteredOrderedIds: string[],
  from: number,
  to: number
): string[] {
  if (filteredOrderedIds.length === 0) return globalOrder;
  const F = [...filteredOrderedIds];
  const clampedFrom = Math.max(0, Math.min(from, F.length - 1));
  const clampedTo = Math.max(0, Math.min(to, F.length - 1));
  const [moved] = F.splice(clampedFrom, 1);
  F.splice(clampedTo, 0, moved);
  const filteredSet = new Set(F);
  const filIndices = globalOrder.map((id, i) => (filteredSet.has(id) ? i : -1)).filter(i => i >= 0);
  if (filIndices.length !== F.length) return globalOrder;
  const out = globalOrder.slice();
  F.forEach((id, j) => {
    out[filIndices[j]] = id;
  });
  return out;
}
