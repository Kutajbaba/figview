import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Search } from 'lucide-react';
import { ScreenCard } from './ScreenCard';
import type { ScreenFrame } from '../types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Props {
  screens: ScreenFrame[];
  fileName: string;
}

export function ScreenGrid({ screens, fileName }: Props) {
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState<string>('__all__');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [mobileColumns, setMobileColumns] = useState<number>(4);
  const [desktopColumns, setDesktopColumns] = useState<number>(3);
  const columns = device === 'mobile' ? mobileColumns : desktopColumns;

  const pages = useMemo(() => {
    const set = new Set(screens.map(s => s.pageName));
    return Array.from(set);
  }, [screens]);

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

      <div className="relative border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Screens</h1>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Submit feedback →
            </button>
          </div>

          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search screens…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-full border-border/80 bg-card pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pages</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActivePage('__all__')}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    activePage === '__all__'
                      ? 'bg-foreground text-background'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  All
                </button>
                {pages.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePage(p)}
                    className={cn(
                      'max-w-[200px] truncate rounded-full px-3 py-1.5 text-sm font-medium transition',
                      activePage === p
                        ? 'bg-foreground text-background'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    )}
                    title={p}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

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

              <div className="flex min-w-[180px] flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Columns</span>
                  <span className="font-mono text-foreground">{columns}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={columns}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10);
                    if (device === 'mobile') setMobileColumns(v);
                    else setDesktopColumns(v);
                  }}
                  className="h-2 w-full cursor-pointer accent-foreground"
                  aria-label="Columns per row"
                />
              </div>

              <span className="text-sm text-muted-foreground">{filtered.length} shown</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 py-8 sm:px-8">
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
