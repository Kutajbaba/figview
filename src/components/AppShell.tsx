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

  /** Reveal text when sidebar is hovered or contains focus (expanded rail). */
  const sidebarTextReveal =
    'max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover/sidebar:max-w-[14rem] group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-[14rem] group-focus-within/sidebar:opacity-100';

  return (
    <div className={cn('flex h-dvh min-h-0 overflow-hidden bg-background', className)}>
      <aside className="group/sidebar relative z-20 flex h-full min-h-0 w-16 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-border bg-card py-6 pl-2 pr-2 transition-[width,padding] duration-200 ease-out hover:w-[260px] hover:px-4 focus-within:w-[260px] focus-within:px-4">
        <div className="flex shrink-0 items-center justify-center gap-2 px-1 group-hover/sidebar:justify-start group-hover/sidebar:px-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <span className={cn('text-lg font-semibold tracking-tight', sidebarTextReveal)}>Figview</span>
        </div>

        <Separator className="my-6 shrink-0" />

        <nav className="min-h-0 shrink-0 px-1 group-hover/sidebar:px-0" aria-label="Main">
          <p
            className={cn(
              'mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground',
              'max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity,margin] duration-200 ease-out',
              'group-hover/sidebar:mb-2 group-hover/sidebar:max-h-8 group-hover/sidebar:opacity-100',
              'group-focus-within/sidebar:mb-2 group-focus-within/sidebar:max-h-8 group-focus-within/sidebar:opacity-100'
            )}
          >
            {shareViewer ? 'View' : 'App'}
          </p>
          <ul className="flex flex-col gap-0.5">
            {nav.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <li key={id} className="w-full min-w-0">
                  <button
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => onSectionChange(id)}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 rounded-lg py-2 text-left text-sm font-medium transition-colors',
                      'justify-center px-2 group-hover/sidebar:justify-start group-hover/sidebar:px-3',
                      'group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-3',
                      active
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    <span className={cn('min-w-0', sidebarTextReveal)}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {showPageNav && (
          <>
            <Separator
              className={cn(
                'my-4 shrink-0 transition-opacity duration-200',
                'opacity-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100'
              )}
            />
            <nav
              className={cn(
                'min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1 transition-[opacity,max-height] duration-200 ease-out',
                'max-h-0 opacity-0 group-hover/sidebar:max-h-[min(60vh,28rem)] group-hover/sidebar:opacity-100 group-hover/sidebar:px-0',
                'group-focus-within/sidebar:max-h-[min(60vh,28rem)] group-focus-within/sidebar:opacity-100 group-focus-within/sidebar:px-0'
              )}
              aria-label="Figma pages"
            >
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

        <div className="min-w-0 shrink-0 space-y-3 overflow-x-hidden px-2 pb-2">
          {!shareViewer && (
            <Button
              variant="outline"
              type="button"
              aria-label="New file"
              title="New file"
              className={cn(
                'h-10 shrink-0 overflow-hidden rounded-xl transition-[width,gap,padding] duration-200 ease-out',
                'w-10 min-w-10 max-w-10 justify-center gap-0 px-0',
                'group-hover/sidebar:w-full group-hover/sidebar:max-w-none group-hover/sidebar:min-w-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-2 group-hover/sidebar:px-4',
                'group-focus-within/sidebar:w-full group-focus-within/sidebar:max-w-none group-focus-within/sidebar:min-w-0 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-2 group-focus-within/sidebar:px-4'
              )}
              onClick={onNewFile}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className={cn('min-w-0 shrink', sidebarTextReveal)}>New file</span>
            </Button>
          )}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
