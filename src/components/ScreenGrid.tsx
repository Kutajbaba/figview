import { useState, useMemo, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Focus, LayoutGrid, Search } from 'lucide-react';
import { ScreenCard } from './ScreenCard';
import { ScreenFilmstrip } from './ScreenFilmstrip';
import { SingleScreenStage } from './SingleScreenStage';
import type { ScreenFrame } from '../types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
}

interface Props {
  screens: ScreenFrame[];
  activePage: string;
}

export function ScreenGrid({ screens, activePage }: Props) {
  const [search, setSearch] = useState('');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileColumns, setMobileColumns] = useState<number>(4);
  const [desktopColumns, setDesktopColumns] = useState<number>(3);
  const columns = device === 'mobile' ? mobileColumns : desktopColumns;
  const MIN_COLS = 1;
  const MAX_COLS = 6;

  const setColumnsForDevice = (next: number) => {
    const v = Math.min(MAX_COLS, Math.max(MIN_COLS, next));
    if (device === 'mobile') setMobileColumns(v);
    else setDesktopColumns(v);
  };

  const pageTitle =
    activePage === '__all__'
      ? 'All pages'
      : sanitizePageNavLabel(activePage) || activePage;

  const filtered = useMemo(() => {
    let result = screens.filter(s => s.kind === device);
    if (activePage !== '__all__') result = result.filter(s => s.pageName === activePage);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [screens, device, activePage, search]);

  const filteredIdsKey = useMemo(() => filtered.map(s => s.id).join(','), [filtered]);

  useEffect(() => {
    setSelectedIndex(i => {
      if (filtered.length === 0) return 0;
      return Math.min(i, filtered.length - 1);
    });
  }, [filteredIdsKey]);

  const goPrev = useCallback(() => {
    setSelectedIndex(i => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex(i => (filtered.length ? Math.min(filtered.length - 1, i + 1) : 0));
  }, [filtered.length]);

  useEffect(() => {
    if (viewMode !== 'single' || filtered.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, filtered.length, goPrev, goNext]);

  const singleScreen = filtered[selectedIndex];
  const positionLabel =
    filtered.length > 0 ? `${selectedIndex + 1} / ${filtered.length}` : '0 / 0';

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Full width of main (from sidebar edge); filmstrip sits below */}
      <div className="relative z-10 shrink-0 border-b border-border bg-background/80 py-4 backdrop-blur-md">
        <div className="grid w-full grid-cols-1 gap-3 px-6 sm:grid-cols-[1fr_minmax(0,44rem)_1fr] sm:items-center sm:gap-x-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <Tabs value={device} onValueChange={v => setDevice(v as 'mobile' | 'desktop')}>
                <TabsList className="h-10 rounded-full">
                  <TabsTrigger value="mobile" className="rounded-full">
                    Mobile
                  </TabsTrigger>
                  <TabsTrigger value="desktop" className="rounded-full">
                    Desktop
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <span className="text-sm text-muted-foreground">{filtered.length} shown</span>
            </div>

            {/* Search stays in the top bar — wide column (2× default); default input height */}
            <div className="relative w-full max-w-4xl sm:mx-auto sm:max-w-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search screens…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border-border/80 bg-card pl-10"
                aria-label="Search screens"
              />
            </div>

            {viewMode === 'grid' && (
              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Columns</span>
                <div
                  className="flex flex-row items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                  role="group"
                  aria-label="Columns per row"
                >
                  <button
                    type="button"
                    className="flex h-10 w-9 shrink-0 items-center justify-center text-lg font-semibold leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    onClick={() => setColumnsForDevice(columns - 1)}
                    disabled={columns <= MIN_COLS}
                    aria-label="Decrease columns"
                  >
                    <span aria-hidden>−</span>
                  </button>
                  <span className="flex min-w-[2.25rem] items-center justify-center border-x border-border px-2 font-mono text-sm font-semibold tabular-nums text-foreground">
                    {columns}
                  </span>
                  <button
                    type="button"
                    className="flex h-10 w-9 shrink-0 items-center justify-center text-lg font-semibold leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    onClick={() => setColumnsForDevice(columns + 1)}
                    disabled={columns >= MAX_COLS}
                    aria-label="Increase columns"
                  >
                    <span aria-hidden>+</span>
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {viewMode === 'single' && filtered.length > 0 && (
          <ScreenFilmstrip
            screens={filtered}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        )}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-subtle bg-grid opacity-40"
            aria-hidden
          />

          <div className="relative flex-1 overflow-auto">
            <div className="relative mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h1
                  className="min-w-0 max-w-full text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
                  title={activePage === '__all__' ? undefined : activePage}
                >
                  {pageTitle}
                </h1>
                <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'grid' | 'single')}>
                  <TabsList className="h-10 rounded-full" aria-label="View mode">
                    <TabsTrigger value="grid" className="gap-1.5 rounded-full px-3">
                      <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="single" className="gap-1.5 rounded-full px-3">
                      <Focus className="h-3.5 w-3.5" aria-hidden />
                      Single
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {filtered.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground">No screens match your filters.</p>
              ) : viewMode === 'single' && singleScreen ? (
                <SingleScreenStage screen={singleScreen} positionLabel={positionLabel} />
              ) : (
                <div
                  className="screen-grid-tw"
                  style={{ '--columns': columns } as CSSProperties}
                >
                  {filtered.map((screen, i) => (
                    <ScreenCard key={screen.id} screen={screen} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
