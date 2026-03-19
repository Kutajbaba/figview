import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ScreenCard } from './ScreenCard';
import type { ScreenFrame } from '../types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

interface Props {
  screens: ScreenFrame[];
  activePage: string;
}

export function ScreenGrid({ screens, activePage }: Props) {
  const [search, setSearch] = useState('');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
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

  return (
    <div className="relative min-h-screen">
      {/* subtle grid like reference dashboard */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-subtle bg-grid opacity-40"
        aria-hidden
      />

      <div className="relative border-b border-border bg-background/80 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 sm:px-8">
          <h1
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            title={activePage === '__all__' ? undefined : activePage}
          >
            {pageTitle}
          </h1>

          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_minmax(0,22rem)_1fr] sm:items-center sm:gap-x-6 sm:gap-y-0">
            <div className="flex flex-wrap items-center gap-4 justify-self-start">
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

            <div className="relative w-full max-w-md justify-self-center sm:max-w-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search screens…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border-border/80 bg-card pl-10"
              />
            </div>

            <div className="flex w-full items-center justify-end gap-3 justify-self-end sm:w-auto">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Columns</span>
              <div
                className="flex flex-row items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                role="group"
                aria-label="Columns per row"
              >
                <button
                  type="button"
                  className="flex h-10 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  onClick={() => setColumnsForDevice(columns - 1)}
                  disabled={columns <= MIN_COLS}
                  aria-label="Decrease columns"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="flex min-w-[2.25rem] items-center justify-center border-x border-border px-2 font-mono text-sm font-semibold tabular-nums text-foreground">
                  {columns}
                </span>
                <button
                  type="button"
                  className="flex h-10 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                  onClick={() => setColumnsForDevice(columns + 1)}
                  disabled={columns >= MAX_COLS}
                  aria-label="Increase columns"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Explore <span className="text-muted-foreground">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No screens match your filters.</p>
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
  );
}
