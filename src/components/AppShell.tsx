import type { ReactNode } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Plus,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

export type AppSection = 'dashboard' | 'designs' | 'account' | 'analytics';

interface Props {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  fileName: string;
  screenCount: number;
  /** Figma page list — only used when section is `designs` and the page nav is visible. */
  pages: string[];
  activePage: string;
  onPageChange: (pageId: string) => void;
  onNewFile: () => void;
  children: ReactNode;
  className?: string;
  /**
   * When set, controls whether the sidebar “Pages” block appears.
   * Omit to use default: Designs section with at least one screen.
   */
  figmaPageNavVisible?: boolean;
  /** View-only share links: slim sidebar, no account/dashboard or new file. */
  shareViewer?: boolean;
}

const navItems: { id: AppSection; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'designs', label: 'Designs', icon: LayoutGrid },
  { id: 'account', label: 'Account', icon: UserRound },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppShell({
  activeSection,
  onSectionChange,
  fileName,
  screenCount,
  pages,
  activePage,
  onPageChange,
  onNewFile,
  children,
  className,
  figmaPageNavVisible,
  shareViewer = false,
}: Props) {
  const showPageNav =
    figmaPageNavVisible !== undefined
      ? figmaPageNavVisible
      : activeSection === 'designs' && screenCount > 0;

  const nav = shareViewer
    ? navItems.filter(i => i.id === 'designs')
    : navItems;

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

        <nav className="min-h-0 shrink-0 px-2" aria-label="Main">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {shareViewer ? 'View' : 'App'}
          </p>
          <ul className="flex flex-col gap-0.5">
            {nav.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <li key={id} className="w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => onSectionChange(id)}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {showPageNav && (
          <>
            <Separator className="my-4 shrink-0" />
            <nav className="min-h-0 flex-1 overflow-y-auto px-2" aria-label="Figma pages">
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
          </>
        )}

        {!showPageNav && <div className="min-h-0 flex-1" />}

        <Separator className="my-4 shrink-0" />

        <div className="shrink-0 space-y-3 px-2 pb-2">
          <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
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
          {!shareViewer && (
            <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={onNewFile}>
              <Plus className="h-4 w-4" />
              New file
            </Button>
          )}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
