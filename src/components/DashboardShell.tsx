import type { ReactNode } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

interface Props {
  fileName: string;
  screenCount: number;
  onNewFile: () => void;
  pages: string[];
  activePage: string;
  onPageChange: (pageId: string) => void;
  children: ReactNode;
  className?: string;
}

export function DashboardShell({
  fileName,
  screenCount,
  onNewFile,
  pages,
  activePage,
  onPageChange,
  children,
  className,
}: Props) {
  return (
    <div className={cn('flex h-dvh min-h-0 overflow-hidden bg-background', className)}>
      <aside className="flex h-full min-h-0 w-[260px] shrink-0 flex-col overflow-hidden border-r border-border bg-card px-4 py-6">
        <div className="flex shrink-0 items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Figview</span>
        </div>

        <Separator className="my-6 shrink-0" />

        <div className="shrink-0 px-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current file</p>
          <p className="mt-1 line-clamp-3 text-sm font-medium leading-snug" title={fileName}>
            {fileName || 'Untitled'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{screenCount} screens indexed</p>
        </div>

        <Separator className="my-4 shrink-0" />

        <nav className="min-h-0 flex-1 overflow-y-auto px-2" aria-label="Pages">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pages</p>
          <ul className="flex flex-col gap-0.5">
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

        <div className="mt-4 shrink-0 space-y-2 px-2 pb-2">
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={onNewFile}>
            <Plus className="h-4 w-4" />
            New file
          </Button>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            type="button"
          >
            Submit feedback →
          </Button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
