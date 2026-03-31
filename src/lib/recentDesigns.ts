const STORAGE_KEY = 'figview:recent-designs';
const MAX_ITEMS = 12;

export interface RecentDesignRecord {
  fileKey: string;
  fileName: string;
  rawUrl: string;
  thumbnailUrl: string | null;
  viewedAt: string;
}

function isRecentDesignRecord(x: unknown): x is RecentDesignRecord {
  if (x === null || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.fileKey === 'string' &&
    typeof r.fileName === 'string' &&
    typeof r.rawUrl === 'string' &&
    (r.thumbnailUrl === null || typeof r.thumbnailUrl === 'string') &&
    typeof r.viewedAt === 'string'
  );
}

export function getRecentDesigns(): RecentDesignRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentDesignRecord);
  } catch {
    return [];
  }
}

export function recordRecentDesign(
  entry: Omit<RecentDesignRecord, 'viewedAt'> & { viewedAt?: string }
): void {
  const viewedAt = entry.viewedAt ?? new Date().toISOString();
  const prev = getRecentDesigns();
  const others = prev.filter(p => p.fileKey !== entry.fileKey);
  const next: RecentDesignRecord[] = [
    {
      fileKey: entry.fileKey,
      fileName: entry.fileName,
      rawUrl: entry.rawUrl,
      thumbnailUrl: entry.thumbnailUrl,
      viewedAt,
    },
    ...others,
  ].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('figview:recent-changed'));
}

export function removeRecentDesign(fileKey: string): void {
  const prev = getRecentDesigns();
  const next = prev.filter(p => p.fileKey !== fileKey);
  if (next.length === prev.length) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('figview:recent-changed'));
}
