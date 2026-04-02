import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { Focus, LayoutGrid, Search } from 'lucide-react';
import { FigmaPagesSideNav } from './FigmaPagesSideNav';
import { ScreenCard } from './ScreenCard';
import { ScreenFilmstrip } from './ScreenFilmstrip';
import { SingleScreenStage } from './SingleScreenStage';
import type { ScreenFrame } from '../types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';
import { moveIndexInArray, reorderGlobalFromFilteredMove } from '@/lib/screenLayout';
import { cn } from '@/lib/utils';

type GridPointerDrag = {
  pointerId: number;
  screenId: string;
  sourceIndex: number;
  overIndex: number;
  offsetX: number;
  offsetY: number;
  floatW: number;
  floatH: number;
  clientX: number;
  clientY: number;
  screen: ScreenFrame;
  filterSigAtStart: string;
  origin: 'grid' | 'filmstrip';
};

function hitPreviewSlotIndex(
  clientX: number,
  clientY: number,
  preview: ScreenFrame[],
  refs: Record<string, HTMLElement | null>
): number {
  for (let i = 0; i < preview.length; i++) {
    const el = refs[preview[i].id];
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const m = 8;
    if (
      clientX >= r.left - m &&
      clientX <= r.right + m &&
      clientY >= r.top - m &&
      clientY <= r.bottom + m
    ) {
      return i;
    }
  }
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < preview.length; i++) {
    const el = refs[preview[i].id];
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const cx = (r.left + r.right) / 2;
    const cy = (r.top + r.bottom) / 2;
    const dist = (clientX - cx) ** 2 + (clientY - cy) ** 2;
    if (dist < bestD) {
      bestD = dist;
      best = i;
    }
  }
  return best;
}

function GridReorderPlaceholder({ kind }: { kind: 'mobile' | 'desktop' }) {
  const aspect = kind === 'mobile' ? 'aspect-[9/16]' : 'aspect-video';
  return (
    <div className="min-w-0 select-none" aria-hidden>
      <div className={cn('rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5', aspect)} />
      <div className="mt-3 h-4 w-[70%] rounded bg-muted/60" />
      <div className="mt-1 h-3 w-[45%] rounded bg-muted/50" />
    </div>
  );
}

function ScreenDragFloatPreview({ screen }: { screen: ScreenFrame }) {
  const [loaded, setLoaded] = useState(false);
  const aspect = screen.kind === 'mobile' ? 'aspect-[9/16]' : 'aspect-video';
  return (
    <div className="flex h-full min-h-0 flex-col p-1">
      <div
        className={cn(
          'relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border/80 bg-muted/30',
          aspect
        )}
      >
        {screen.thumbnailUrl ? (
          <>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
            <img
              src={screen.thumbnailUrl}
              alt=""
              className={cn('h-full w-full object-contain', loaded ? 'opacity-100' : 'opacity-0')}
              onLoad={() => setLoaded(true)}
              draggable={false}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground opacity-50">◻</div>
        )}
      </div>
      <p className="mt-2 shrink-0 truncate text-sm font-medium leading-tight">{screen.name}</p>
      <p className="shrink-0 truncate text-xs text-muted-foreground">{screen.pageName}</p>
    </div>
  );
}

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
  /** Figma file pages — rendered as a secondary nav beside the screen content. */
  figmaPages: string[];
  onFigmaPageChange: (pageId: string) => void;
  /** When true, hide drag handles and persist callbacks (shared view-only links). */
  layoutReadOnly?: boolean;
  /** Persist full-file screen order after a drag-reorder in the grid. */
  onPersistScreenOrder?: (nextOrder: string[]) => void;
}

export function ScreenGrid({
  screens,
  activePage,
  figmaPages,
  onFigmaPageChange,
  layoutReadOnly,
  onPersistScreenOrder,
}: Props) {
  const [pointerDrag, setPointerDrag] = useState<GridPointerDrag | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stripCellRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const gridScrollRef = useRef<HTMLDivElement | null>(null);
  const stripScrollRef = useRef<HTMLElement | null>(null);
  const pointerDragRef = useRef<GridPointerDrag | null>(null);
  const filteredRef = useRef<ScreenFrame[]>([]);
  const screensRef = useRef<ScreenFrame[]>([]);
  const persistRef = useRef<Props['onPersistScreenOrder']>(undefined);

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

  useLayoutEffect(() => {
    filteredRef.current = filtered;
    screensRef.current = screens;
    persistRef.current = onPersistScreenOrder;
  }, [filtered, screens, onPersistScreenOrder]);

  const filterSig = useMemo(() => filtered.map(s => s.id).join('\0'), [filtered]);

  useLayoutEffect(() => {
    pointerDragRef.current = pointerDrag;
  }, [pointerDrag]);

  useLayoutEffect(() => {
    const d = pointerDragRef.current;
    if (d && filterSig !== d.filterSigAtStart) {
      /* Drop in-flight reorder when filters/device/search change mid-drag */
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional abort
      setPointerDrag(null);
    }
  }, [filterSig]);

  const dragActive = pointerDrag !== null;

  useEffect(() => {
    return () => {
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('touch-action');
      document.body.style.removeProperty('cursor');
    };
  }, []);

  useEffect(() => {
    if (!dragActive) {
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('touch-action');
      document.body.style.removeProperty('cursor');
      return;
    }
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    document.body.style.cursor = 'grabbing';

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      setPointerDrag(prev => {
        if (!prev || e.pointerId !== prev.pointerId) return prev;
        const sc =
          prev.origin === 'grid' ? gridScrollRef.current : stripScrollRef.current;
        if (sc) {
          const r = sc.getBoundingClientRect();
          const margin = 72;
          const step = 18;
          if (e.clientY > r.bottom - margin) sc.scrollTop += step;
          else if (e.clientY < r.top + margin) sc.scrollTop -= step;
        }
        const f = filteredRef.current;
        const preview = moveIndexInArray(f, prev.sourceIndex, prev.overIndex);
        const refMap =
          prev.origin === 'grid'
            ? (cellRefs.current as Record<string, HTMLElement | null>)
            : (stripCellRefs.current as Record<string, HTMLElement | null>);
        const hit = hitPreviewSlotIndex(e.clientX, e.clientY, preview, refMap);
        if (
          prev.overIndex === hit &&
          prev.clientX === e.clientX &&
          prev.clientY === e.clientY
        ) {
          return prev;
        }
        return { ...prev, overIndex: hit, clientX: e.clientX, clientY: e.clientY };
      });
    };

    const endDrag = (e: PointerEvent) => {
      let stripSelectIdx: number | null = null;
      setPointerDrag(prev => {
        if (!prev || e.pointerId !== prev.pointerId) return prev;
        if (prev.origin === 'filmstrip') stripSelectIdx = prev.overIndex;
        const persist = persistRef.current;
        const f = filteredRef.current;
        const g = screensRef.current;
        if (persist && prev.sourceIndex !== prev.overIndex) {
          const filteredIds = f.map(s => s.id);
          const globalOrder = g.map(s => s.id);
          persist(reorderGlobalFromFilteredMove(globalOrder, filteredIds, prev.sourceIndex, prev.overIndex));
        }
        return null;
      });
      if (stripSelectIdx !== null) {
        const n = filteredRef.current.length;
        if (n > 0) {
          const idx = Math.max(0, Math.min(stripSelectIdx, n - 1));
          queueMicrotask(() => setSelectedIndex(idx));
        }
      }
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('touch-action');
      document.body.style.removeProperty('cursor');
    };
  }, [dragActive]);

  const previewFiltered = useMemo(() => {
    if (!pointerDrag || pointerDrag.origin !== 'grid') return filtered;
    return moveIndexInArray(filtered, pointerDrag.sourceIndex, pointerDrag.overIndex);
  }, [filtered, pointerDrag]);

  const filmstripScreens = useMemo(() => {
    if (!pointerDrag || pointerDrag.origin !== 'filmstrip') return filtered;
    return moveIndexInArray(filtered, pointerDrag.sourceIndex, pointerDrag.overIndex);
  }, [filtered, pointerDrag]);

  const handleGripPointerDown = useCallback(
    (screen: ScreenFrame, e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!onPersistScreenOrder || layoutReadOnly || viewMode !== 'grid' || filtered.length < 2) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const sourceIndex = filtered.findIndex(s => s.id === screen.id);
      if (sourceIndex < 0) return;
      const article = (e.currentTarget as HTMLElement).closest('[data-screen-root]') as HTMLElement | null;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      setPointerDrag({
        pointerId: e.pointerId,
        screenId: screen.id,
        sourceIndex,
        overIndex: sourceIndex,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        floatW: rect.width,
        floatH: rect.height,
        clientX: e.clientX,
        clientY: e.clientY,
        screen,
        filterSigAtStart: filterSig,
        origin: 'grid',
      });
    },
    [onPersistScreenOrder, layoutReadOnly, viewMode, filtered, filterSig]
  );

  const handleStripGripPointerDown = useCallback(
    (screen: ScreenFrame, e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!onPersistScreenOrder || layoutReadOnly || viewMode !== 'single' || filtered.length < 2) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const sourceIndex = filtered.findIndex(s => s.id === screen.id);
      if (sourceIndex < 0) return;
      const root = (e.currentTarget as HTMLElement).closest('[data-strip-item]') as HTMLElement | null;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      setPointerDrag({
        pointerId: e.pointerId,
        screenId: screen.id,
        sourceIndex,
        overIndex: sourceIndex,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        floatW: rect.width,
        floatH: rect.height,
        clientX: e.clientX,
        clientY: e.clientY,
        screen,
        filterSigAtStart: filterSig,
        origin: 'filmstrip',
      });
    },
    [onPersistScreenOrder, layoutReadOnly, viewMode, filtered, filterSig]
  );

  const setStripItemRef = useCallback((id: string) => (el: HTMLLIElement | null) => {
    stripCellRefs.current[id] = el;
  }, []);

  const clampedSelectedIndex = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.min(selectedIndex, filtered.length - 1);
  }, [filtered.length, selectedIndex]);

  const clampSelectedIndex = useCallback(
    (i: number) => {
      if (filtered.length === 0) return 0;
      return Math.max(0, Math.min(i, filtered.length - 1));
    },
    [filtered.length]
  );

  const goPrev = useCallback(() => {
    setSelectedIndex(i => clampSelectedIndex(i - 1));
  }, [clampSelectedIndex]);

  const goNext = useCallback(() => {
    setSelectedIndex(i => clampSelectedIndex(i + 1));
  }, [clampSelectedIndex]);

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

  const singleScreen = filtered[clampedSelectedIndex];
  const positionLabel =
    filtered.length > 0
      ? `${clampedSelectedIndex + 1} / ${filtered.length}`
      : '0 / 0';

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
              {onPersistScreenOrder &&
                !layoutReadOnly &&
                (viewMode === 'grid' || viewMode === 'single') &&
                filtered.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    · Drag handles to reorder · saved automatically
                  </span>
                )}
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
            scrollRef={stripScrollRef}
            screens={filmstripScreens}
            selectedIndex={clampedSelectedIndex}
            onSelect={i => setSelectedIndex(clampSelectedIndex(i))}
            reorderEnabled={
              Boolean(onPersistScreenOrder) && !layoutReadOnly && filtered.length > 1
            }
            draggingScreenId={
              pointerDrag?.origin === 'filmstrip' ? pointerDrag.screenId : null
            }
            setItemRef={setStripItemRef}
            onGripPointerDown={handleStripGripPointerDown}
          />
        )}

        <FigmaPagesSideNav
          pages={figmaPages}
          activePage={activePage}
          onPageChange={onFigmaPageChange}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-grid-subtle bg-grid opacity-40"
            aria-hidden
          />

          <div
            ref={gridScrollRef}
            className="relative h-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
          >
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
              ) : (
                <>
                  {viewMode === 'single' && singleScreen ? (
                    <SingleScreenStage screen={singleScreen} positionLabel={positionLabel} />
                  ) : (
                    <div className="relative">
                      <div
                        className="screen-grid-tw"
                        style={{ '--columns': columns } as CSSProperties}
                      >
                        {previewFiltered.map((screen, i) => (
                          <div
                            key={screen.id}
                            ref={el => {
                              cellRefs.current[screen.id] = el;
                            }}
                            className="screen-grid-cell min-w-0"
                          >
                            {pointerDrag?.origin === 'grid' && pointerDrag.screenId === screen.id ? (
                              <GridReorderPlaceholder kind={screen.kind} />
                            ) : (
                              <ScreenCard
                                screen={screen}
                                index={i}
                                reorderEnabled={
                                  Boolean(onPersistScreenOrder) &&
                                  !layoutReadOnly &&
                                  viewMode === 'grid' &&
                                  filtered.length > 1
                                }
                                onReorderHandlePointerDown={
                                  onPersistScreenOrder && !layoutReadOnly && viewMode === 'grid'
                                    ? e => handleGripPointerDown(screen, e)
                                    : undefined
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pointerDrag && (
                    <div
                      className="pointer-events-none fixed z-[200] overflow-hidden rounded-2xl border-2 border-primary/35 bg-card/98 shadow-2xl shadow-foreground/10 ring-2 ring-background backdrop-blur-sm"
                      style={{
                        left: pointerDrag.clientX - pointerDrag.offsetX,
                        top: pointerDrag.clientY - pointerDrag.offsetY,
                        width: pointerDrag.floatW,
                        height: pointerDrag.floatH,
                      }}
                    >
                      <ScreenDragFloatPreview screen={pointerDrag.screen} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
