import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { History } from 'lucide-react';
import type { RecentDesignRecord } from '@/lib/recentDesigns';
import { getRecentDesigns, removeRecentDesign, shareRecentDesign } from '@/lib/recentDesigns';
import { cn } from '@/lib/utils';
import { DesignFileCard } from '@/components/DesignFileCard';

const RECENT_CHANGED = 'figview:recent-changed';

interface Props {
  onOpenRecent: (entry: RecentDesignRecord) => void;
  embedded?: boolean;
  /** When true, empty-state copy refers to sidebar “New file” instead of “above”. */
  appContext?: boolean;
}

export function RecentDesignsSection({
  onOpenRecent,
  embedded = false,
  appContext = false,
}: Props) {
  const [items, setItems] = useState<RecentDesignRecord[]>(getRecentDesigns);

  useEffect(() => {
    const sync = () => setItems(getRecentDesigns());
    window.addEventListener(RECENT_CHANGED, sync);
    return () => window.removeEventListener(RECENT_CHANGED, sync);
  }, []);

  const onKeyOpen = useCallback(
    (e: KeyboardEvent, entry: RecentDesignRecord) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenRecent(entry);
      }
    },
    [onOpenRecent]
  );

  const onRemoveRecent = useCallback((fileKey: string) => {
    removeRecentDesign(fileKey);
  }, []);

  const showRecentGrid = items.length > 0;

  const content = (
    <div className={embedded ? '' : 'mx-auto w-full max-w-6xl px-6 sm:px-8'}>
      <section
        className={embedded ? 'mt-0' : 'mt-20'}
        aria-labelledby="recent-designs-heading"
      >
        <h2
          id="recent-designs-heading"
          className="font-ibmPlexMono text-lg font-semibold tracking-tight text-stone-900"
        >
          Recent designs
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Files you&apos;ve opened in this browser, with last opened time.
        </p>

        {showRecentGrid ? (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(entry => (
              <li key={entry.fileKey}>
                <DesignFileCard
                  fileName={entry.fileName}
                  viewedAtIso={entry.viewedAt}
                  thumbnailUrl={entry.thumbnailUrl}
                  onClick={() => onOpenRecent(entry)}
                  onKeyDown={e => onKeyOpen(e, entry)}
                  menu={{
                    onRemove: () => onRemoveRecent(entry.fileKey),
                    onShare: () => void shareRecentDesign(entry),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {items.length === 0 && (
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-white/40 px-6 py-16 text-center',
              showRecentGrid ? 'mt-8' : 'mt-10'
            )}
            role="status"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white/80 text-stone-500">
              <History className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="mt-5 text-sm font-medium text-stone-800">No recent designs yet</p>
            <p className="mt-2 max-w-sm text-sm text-stone-600">
              {appContext
                ? 'Use New file in the sidebar to open the setup page, load a Figma file, then your recent files will appear here with thumbnails and timestamps.'
                : 'Load a file above. Successful opens show up here with a thumbnail and timestamp.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );

  return embedded ? (
    <>{content}</>
  ) : (
    <div className="relative z-10 border-t border-stone-200/60 bg-[#F0E8DE]/35 py-16 sm:py-20">
      {content}
    </div>
  );
}
