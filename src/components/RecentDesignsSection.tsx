import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import {
  ClipboardList,
  History,
  ImageOff,
  LayoutGrid,
  MoreVertical,
  MousePointerClick,
  Trash2,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { RecentDesignRecord } from '@/lib/recentDesigns';
import { getRecentDesigns, removeRecentDesign } from '@/lib/recentDesigns';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RECENT_CHANGED = 'figview:recent-changed';

const benefits: readonly {
  title: string;
  icon: LucideIcon;
  delay: string;
  iconClassName?: string;
}[] = [
  {
    title: 'Instant Overview',
    icon: LayoutGrid,
    delay: '0ms',
    iconClassName: 'size-5',
  },
  {
    title: 'Start prototype from any screen',
    icon: MousePointerClick,
    delay: '60ms',
  },
  {
    title: 'Find any screen in seconds',
    icon: ClipboardList,
    delay: '120ms',
  },
  {
    title: 'Reorder frames and share',
    icon: Share2,
    delay: '180ms',
  },
];

function formatViewedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

interface Props {
  onOpenRecent: (entry: RecentDesignRecord) => void;
  embedded?: boolean;
}

export function RecentDesignsSection({ onOpenRecent, embedded = false }: Props) {
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

  const onShareRecent = useCallback(async (entry: RecentDesignRecord) => {
    const url = entry.rawUrl;
    const title = entry.fileName;

    // Prefer native share when available; otherwise fall back to copying the URL.
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

    // Legacy clipboard fallback.
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', 'true');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }, []);

  const content = (
    <div className={embedded ? '' : 'mx-auto w-full max-w-6xl px-6 sm:px-8'}>
      <section
        className={cn(
          'mx-auto w-fit max-w-5xl flex flex-col items-center justify-center text-left text-[12px] leading-normal',
          embedded ? 'mt-0 h-fit mb-14' : 'mt-20'
        )}
        aria-labelledby="benefits-heading"
      >
        <h2
          id="benefits-heading"
          className="mb-2 w-fit text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-500"
        >
          Why teams use Figview
        </h2>
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Why teams use Figview — scroll horizontally"
          className="relative w-fit -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8"
        >
          <div
            tabIndex={0}
            className={cn(
              'mx-auto flex h-fit w-fit max-w-full snap-x snap-mandatory items-center justify-center gap-3 overflow-x-auto scroll-smooth px-0 py-2 text-center',
              '[scrollbar-width:thin]',
              '[scrollbar-color:rgba(120,113,108,0.4)_transparent]',
              '[&::-webkit-scrollbar]:h-2',
              '[&::-webkit-scrollbar-thumb]:rounded-full',
              '[&::-webkit-scrollbar-thumb]:bg-stone-400/50'
            )}
          >
            {benefits.map(({ title, icon: Icon, delay, iconClassName }) => (
              <Card
                key={title}
                className={cn(
                  'group w-fit shrink-0 snap-center rounded-full border border-stone-200/70 bg-white/50 shadow-none',
                  'backdrop-blur-none transition-colors duration-200',
                  'animate-fade-in hover:border-stone-300/80 hover:bg-white/70'
                )}
                style={{ animationDelay: delay }}
              >
                <CardContent className="flex h-fit w-fit flex-row items-center justify-center gap-2 px-4 py-2.5 text-center text-[12px] sm:px-5 sm:py-3">
                  <Icon
                    className={cn(iconClassName ?? 'size-5', 'shrink-0 text-stone-700')}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <h3 className="min-w-0 flex-1 text-pretty text-center text-[12px] font-semibold leading-snug tracking-tight text-stone-900">
                    {title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="pointer-events-none text-center text-[12px] text-stone-500/90 sm:hidden">
            Swipe sideways for more
          </p>
        </div>
      </section>

      <section aria-labelledby="recent-designs-heading">
        <h2
          id="recent-designs-heading"
          className="font-ibmPlexMono text-lg font-semibold tracking-tight text-stone-900"
        >
          Recent designs
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Files you&apos;ve opened in this browser, with last opened time.
        </p>

        {items.length === 0 ? (
          <div
            className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-white/40 px-6 py-16 text-center"
            role="status"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white/80 text-stone-500">
              <History className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="mt-5 text-sm font-medium text-stone-800">No recent designs yet</p>
            <p className="mt-2 max-w-sm text-sm text-stone-600">
              Load a file above. Successful opens show up here with a thumbnail and timestamp.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(entry => (
              <li key={entry.fileKey}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenRecent(entry)}
                  onKeyDown={e => onKeyOpen(e, entry)}
                  className={cn(
                    'group relative flex w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 text-left shadow-sm',
                    'transition-colors hover:border-stone-400/80 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900'
                  )}
                >
                  <div className="absolute right-2 top-2 z-20">
                    <div className="group relative">
                      <button
                        type="button"
                        className={cn(
                          'rounded-full border border-stone-200/70 bg-white/70 p-1',
                          'text-stone-700 transition-colors duration-150',
                          'hover:bg-white/95'
                        )}
                        aria-label="More actions"
                        aria-haspopup="menu"
                        onClick={e => {
                          // Prevent opening the card when clicking the context menu icon.
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="size-5" strokeWidth={1.75} aria-hidden />
                      </button>
                      <div
                        className={cn(
                          'absolute right-0 top-8 z-30 w-28 rounded-xl border border-stone-200/70 bg-white/95 p-1 shadow-sm backdrop-blur-none',
                          'opacity-0 translate-y-1',
                          'pointer-events-none',
                          'transition-all duration-150',
                          'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
                        )}
                        role="menu"
                        aria-label="Recent design actions"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-stone-900 hover:bg-stone-100/70"
                          role="menuitem"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemoveRecent(entry.fileKey);
                          }}
                        >
                          <Trash2 className="size-4 text-stone-700" strokeWidth={1.75} aria-hidden />
                          Remove
                        </button>
                        <button
                          type="button"
                          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-stone-900 hover:bg-stone-100/70"
                          role="menuitem"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            void onShareRecent(entry);
                          }}
                        >
                          <Share2 className="size-4 text-stone-700" strokeWidth={1.75} aria-hidden />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-stone-100">
                    {entry.thumbnailUrl ? (
                      <img
                        src={entry.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const sib = (e.target as HTMLImageElement).nextElementSibling;
                          if (sib instanceof HTMLElement) sib.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center text-stone-400',
                        entry.thumbnailUrl ? 'hidden' : 'flex'
                      )}
                      aria-hidden
                    >
                      <ImageOff className="h-8 w-8" strokeWidth={1.25} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
                    <span className="truncate text-sm font-semibold text-stone-900">{entry.fileName}</span>
                    <span className="text-xs text-stone-500">Viewed {formatViewedAt(entry.viewedAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  return (
    embedded ? (
      content
    ) : (
      <div className="relative z-10 border-t border-stone-200/60 bg-[#F0E8DE]/35 py-16 sm:py-20">
        {content}
      </div>
    )
  );
}
