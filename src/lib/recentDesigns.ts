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

/** Keep first occurrence per fileKey (storage should already be unique; this guards corrupt duplicates). */
function dedupeByFileKey(items: RecentDesignRecord[]): RecentDesignRecord[] {
  const seen = new Set<string>();
  const out: RecentDesignRecord[] = [];
  for (const item of items) {
    if (seen.has(item.fileKey)) continue;
    seen.add(item.fileKey);
    out.push(item);
  }
  return out;
}

export function getRecentDesigns(): RecentDesignRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return dedupeByFileKey(parsed.filter(isRecentDesignRecord));
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

/** Web Share API with clipboard / execCommand fallbacks (same behavior as recent-design cards). */
export async function shareRecentDesign(entry: RecentDesignRecord): Promise<void> {
  const url = entry.rawUrl;
  const title = entry.fileName;

  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch {
      // User cancel/unsupported is fine; fall back to clipboard below.
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return;
    } catch {
      // Fall through to legacy copy below.
    }
  }

  const ta = document.createElement('textarea');
  ta.value = url;
  ta.setAttribute('readonly', 'true');
  ta.style.position = 'absolute';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}
