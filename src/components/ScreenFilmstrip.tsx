import { useEffect, useRef } from 'react';
import type { MutableRefObject, PointerEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { ScreenFrame } from '../types';
import { cn } from '@/lib/utils';

function StripReorderPlaceholder({ kind }: { kind: 'mobile' | 'desktop' }) {
  const aspect = kind === 'mobile' ? 'aspect-[9/16]' : 'aspect-video';
  return (
    <div className="min-w-0 select-none" aria-hidden>
      <div className={cn('rounded-xl border-2 border-dashed border-primary/35 bg-primary/5', aspect)} />
      <div className="mt-1 h-3 w-[80%] rounded bg-muted/60" />
    </div>
  );
}

interface Props {
  screens: ScreenFrame[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  scrollRef?: MutableRefObject<HTMLElement | null>;
  reorderEnabled?: boolean;
  draggingScreenId?: string | null;
  setItemRef?: (id: string) => (el: HTMLLIElement | null) => void;
  onGripPointerDown?: (screen: ScreenFrame, e: PointerEvent<HTMLButtonElement>) => void;
}

export function ScreenFilmstrip({
  screens,
  selectedIndex,
  onSelect,
  scrollRef,
  reorderEnabled,
  draggingScreenId,
  setItemRef,
  onGripPointerDown,
}: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeId = screens[selectedIndex]?.id;

  useEffect(() => {
    if (!activeId) return;
    refs.current[activeId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <nav
      ref={scrollRef}
      className="flex min-h-0 w-[14.5rem] max-w-[min(14.5rem,23vw)] shrink-0 flex-col gap-2 self-stretch overflow-y-auto overscroll-y-contain border-r border-border bg-muted/25 px-3 py-4"
      aria-label="Screen thumbnails"
    >
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Screens</p>
      <ul className="flex list-none flex-col gap-6 p-0" role="listbox" aria-label="Choose a screen">
        {screens.map((screen, i) => {
          const selected = i === selectedIndex;
          const aspect = screen.kind === 'mobile' ? 'aspect-[9/16]' : 'aspect-video';
          const isDraggingSlot = draggingScreenId === screen.id;
          const assignRef = setItemRef?.(screen.id);
          return (
            <li key={screen.id} ref={assignRef} className="relative" data-strip-item>
              {reorderEnabled && onGripPointerDown && (
                <button
                  type="button"
                  onPointerDown={e => onGripPointerDown(screen, e)}
                  onClick={e => e.stopPropagation()}
                  className="absolute left-1 top-1 z-10 flex size-7 cursor-grab touch-none items-center justify-center rounded-md border border-border/80 bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm active:cursor-grabbing hover:text-foreground"
                  aria-label={`Drag to reorder: ${screen.name}`}
                >
                  <GripVertical className="size-3.5" aria-hidden />
                </button>
              )}
              {isDraggingSlot ? (
                <StripReorderPlaceholder kind={screen.kind} />
              ) : (
                <>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    ref={el => {
                      refs.current[screen.id] = el;
                    }}
                    onClick={() => onSelect(i)}
                    className={cn(
                      'w-full rounded-xl border-2 bg-card p-0.5 text-left shadow-sm transition-all',
                      aspect,
                      selected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent opacity-80 hover:border-border hover:opacity-100'
                    )}
                    title={screen.name}
                  >
                    <span className="relative block h-full w-full overflow-hidden rounded-lg bg-muted">
                      {screen.thumbnailUrl ? (
                        <img
                          src={screen.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                          ◻
                        </span>
                      )}
                    </span>
                  </button>
                  <span
                    className={cn(
                      'mt-1 line-clamp-2 px-0.5 text-[11px] font-medium leading-tight',
                      selected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    title={screen.name}
                  >
                    {screen.name}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
