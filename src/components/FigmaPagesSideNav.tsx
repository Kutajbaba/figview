import { sanitizePageNavLabel } from '@/lib/pageNavLabel';
import { cn } from '@/lib/utils';

interface Props {
  pages: string[];
  activePage: string;
  onPageChange: (pageId: string) => void;
}

export function FigmaPagesSideNav({ pages, activePage, onPageChange }: Props) {
  return (
    <nav
      className="flex w-[min(13rem,32vw)] max-w-[13rem] shrink-0 flex-col gap-1 self-stretch overflow-y-auto overscroll-y-contain border-r border-border bg-muted/25 px-3 py-4"
      aria-label="Figma pages"
    >
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages</p>
      <ul className="flex list-none flex-col gap-0.5 p-0">
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
    </nav>
  );
}
