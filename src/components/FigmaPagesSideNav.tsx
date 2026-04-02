import { sanitizePageNavLabel } from '@/lib/pageNavLabel';
import { cn } from '@/lib/utils';

interface Props {
  pages: string[];
  activePage: string;
  onPageChange: (pageId: string) => void;
  /** When set, a “current file” summary is pinned to the bottom of this nav. */
  fileName?: string;
  screenCount?: number;
  shareViewer?: boolean;
}

export function FigmaPagesSideNav({
  pages,
  activePage,
  onPageChange,
  fileName,
  screenCount,
  shareViewer = false,
}: Props) {
  const showFileCard = screenCount !== undefined;

  return (
    <nav
      className="flex h-full min-h-0 w-[min(13rem,32vw)] max-w-[13rem] shrink-0 flex-col self-stretch overflow-hidden border-r border-border bg-muted/25"
      aria-label="Figma pages"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages</p>
        <ul className="mt-1 flex list-none flex-col gap-0.5 p-0">
          <li>
            <button
              type="button"
              onClick={() => onPageChange('__all__')}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                activePage === '__all__'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              All pages
            </button>
          </li>
          {pages.map(pageId => {
            const label = sanitizePageNavLabel(pageId) || pageId;
            return (
              <li key={pageId}>
                <button
                  type="button"
                  onClick={() => onPageChange(pageId)}
                  title={pageId}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                    activePage === pageId
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <span className="line-clamp-2">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {showFileCard && (
        <div className="sticky bottom-0 z-[1] shrink-0 border-t border-border bg-muted/25 px-3 pb-4 pt-3">
          <div className="min-w-0 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {shareViewer ? 'Shared library' : 'Current file'}
            </p>
            <p className="mt-1 line-clamp-3 text-sm font-medium leading-snug" title={fileName}>
              {fileName || 'Untitled'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{screenCount} screens indexed</p>
            {shareViewer && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                View-only link: browse and open prototypes. Layout and account tools are hidden.
              </p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
