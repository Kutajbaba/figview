import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Presentation,
  X,
} from 'lucide-react';
import type { ScreenFrame } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screens: ScreenFrame[];
  fileName: string;
}

export function PresentationModeOverlay({ open, onOpenChange, screens, fileName }: Props) {
  const [index, setIndex] = useState(0);
  const thumbRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) setIndex(0);
    prevOpen.current = open;
  }, [open]);

  const n = screens.length;

  useEffect(() => {
    setIndex(i => (n > 0 ? Math.min(i, n - 1) : 0));
  }, [n]);
  const safeIndex = n > 0 ? Math.min(index, n - 1) : 0;
  const current = n > 0 ? screens[safeIndex] : null;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 0) return;
      setIndex(i => {
        const next = i + dir;
        if (next < 0) return n - 1;
        if (next >= n) return 0;
        return next;
      });
    },
    [n]
  );

  useEffect(() => {
    if (!open || !current) return;
    const el = thumbRefs.current[current.id];
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [open, current, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || n === 0) return null;

  const left = safeIndex > 0 ? screens[safeIndex - 1] : null;
  const right = safeIndex < n - 1 ? screens[safeIndex + 1] : null;

  const overlay = (
    <div
      className="fixed inset-0 z-[250] flex flex-col bg-background/95 text-foreground backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-title"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Presentation className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <p id="presentation-title" className="truncate text-sm font-semibold tracking-tight">
              Presentation
            </p>
            <p className="truncate text-xs text-muted-foreground" title={fileName}>
              {fileName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs tabular-nums text-muted-foreground">
            {safeIndex + 1} / {n}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            aria-label="Close presentation"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 items-stretch gap-2 px-2 py-4 sm:gap-4 sm:px-6 sm:py-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 self-center rounded-full sm:h-11 sm:w-11"
            aria-label="Previous screen"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </Button>

          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_minmax(0,4.5fr)_1fr] sm:gap-6">
            <div className="hidden min-h-0 min-w-0 justify-end sm:flex">
              {left ? (
                <button
                  type="button"
                  onClick={() => setIndex(safeIndex - 1)}
                  className={cn(
                    'group flex max-h-[min(52vh,560px)] min-h-0 w-full max-w-[8rem] flex-col overflow-hidden rounded-xl border border-border/60 bg-card/80 opacity-80 shadow-sm transition hover:z-10 hover:border-primary/40 hover:opacity-100 sm:max-w-[11rem]'
                  )}
                  aria-label={`Previous: ${left.name}`}
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    {left.thumbnailUrl ? (
                      <img
                        src={left.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-contain object-top"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-muted-foreground">◻</div>
                    )}
                  </div>
                  <p className="truncate px-1.5 py-1.5 text-left text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                    {left.name}
                  </p>
                </button>
              ) : (
                <div className="w-full max-w-[8rem] sm:max-w-[11rem]" aria-hidden />
              )}
            </div>

            <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-4">
              {current && (
                <>
                  <div className="flex w-full min-w-0 flex-col items-center gap-2 text-center">
                    <h2
                      className="line-clamp-2 text-balance text-lg font-semibold tracking-tight sm:text-xl"
                      title={current.name}
                    >
                      {current.name}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground" title={current.pageName}>
                      {sanitizePageNavLabel(current.pageName) || current.pageName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(current.protoUrl, '_blank', 'noopener')}
                    className="relative flex max-h-[min(62vh,820px)] w-full max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-xl ring-2 ring-primary/15 transition hover:border-primary/40 hover:ring-primary/25"
                    aria-label={`Open prototype: ${current.name}`}
                  >
                    {current.thumbnailUrl ? (
                      <img
                        src={current.thumbnailUrl}
                        alt={current.name}
                        className="max-h-[min(62vh,820px)] w-auto max-w-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex min-h-[min(40vh,400px)] min-w-[200px] items-center justify-center text-muted-foreground">
                        <span className="text-4xl opacity-40">◻</span>
                      </div>
                    )}
                  </button>
                  <Button size="lg" className="gap-2 rounded-full" asChild>
                    <a href={current.protoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open prototype
                    </a>
                  </Button>
                </>
              )}
            </div>

            <div className="hidden min-h-0 min-w-0 justify-start sm:flex">
              {right ? (
                <button
                  type="button"
                  onClick={() => setIndex(safeIndex + 1)}
                  className={cn(
                    'group flex max-h-[min(52vh,560px)] min-h-0 w-full max-w-[8rem] flex-col overflow-hidden rounded-xl border border-border/60 bg-card/80 opacity-80 shadow-sm transition hover:z-10 hover:border-primary/40 hover:opacity-100 sm:max-w-[11rem]'
                  )}
                  aria-label={`Next: ${right.name}`}
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    {right.thumbnailUrl ? (
                      <img
                        src={right.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-contain object-top"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-muted-foreground">◻</div>
                    )}
                  </div>
                  <p className="truncate px-1.5 py-1.5 text-left text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                    {right.name}
                  </p>
                </button>
              ) : (
                <div className="w-full max-w-[8rem] sm:max-w-[11rem]" aria-hidden />
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 self-center rounded-full sm:h-11 sm:w-11"
            aria-label="Next screen"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </Button>
        </div>

        <nav
          className="shrink-0 border-t border-border bg-background/80 px-3 py-3"
          aria-label="All screens"
        >
          <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto overflow-y-hidden pb-1">
            {screens.map((s, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  ref={el => {
                    thumbRefs.current[s.id] = el;
                  }}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'flex shrink-0 flex-col gap-1 rounded-lg border p-1.5 text-left transition',
                    active
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/25'
                      : 'border-border/60 bg-card/50 hover:border-border hover:bg-card'
                  )}
                  aria-label={`Show ${s.name}`}
                  aria-current={active ? 'true' : undefined}
                >
                  <div className="relative h-16 w-[7.25rem] shrink-0 overflow-hidden rounded-md bg-muted/50 sm:h-[4.5rem] sm:w-28">
                    {s.thumbnailUrl ? (
                      <img
                        src={s.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover object-top"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        ◻
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      'max-w-[6rem] truncate text-[10px] font-medium sm:max-w-[7rem]',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    title={s.name}
                  >
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <p className="shrink-0 px-4 pb-3 text-center text-[11px] text-muted-foreground sm:px-6">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ←
          </kbd>{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            →
          </kbd>{' '}
          navigate ·{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>{' '}
          close · click center to open prototype
        </p>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
