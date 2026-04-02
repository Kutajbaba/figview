import type { KeyboardEvent, ReactNode } from 'react';
import { ImageOff, MoreVertical, Share2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatViewedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export interface DesignFileCardMenuProps {
  onRemove: () => void;
  onShare: () => void;
}

function DesignFileCardOverflowMenu({ onRemove, onShare }: DesignFileCardMenuProps) {
  return (
    <div className="absolute right-2 top-2 z-20">
      <div className="group/menu relative">
        <button
          type="button"
          className={cn(
            'rounded-full border border-stone-200/70 bg-white/70 p-1',
            'text-stone-700 transition-colors duration-150',
            'hover:bg-white/95'
          )}
          aria-label="More actions"
          aria-haspopup="menu"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreVertical className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
        <div
          className={cn(
            'absolute right-0 top-8 z-30 w-28 rounded-xl border border-stone-200/70 bg-white/95 p-1 shadow-sm backdrop-blur-none',
            'pointer-events-none opacity-0 translate-y-1',
            'transition-all duration-150',
            'group-hover/menu:pointer-events-auto group-hover/menu:opacity-100 group-hover/menu:translate-y-0'
          )}
          role="menu"
          aria-label="Design file actions"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-stone-900 hover:bg-stone-100/70"
            role="menuitem"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="size-4 text-stone-700" strokeWidth={1.75} aria-hidden />
            Remove
          </button>
          <button
            type="button"
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-stone-900 hover:bg-stone-100/70"
            role="menuitem"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              void onShare();
            }}
          >
            <Share2 className="size-4 text-stone-700" strokeWidth={1.75} aria-hidden />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  fileName: string;
  viewedAtIso: string;
  thumbnailUrl: string | null;
  onClick: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Subtle highlight for the loaded file; does not change border/hover from other cards. */
  isActive?: boolean;
  /** Remove + share overflow (same as homepage recent cards). */
  menu?: DesignFileCardMenuProps;
  /** Extra top-right overlay if menu is not used. */
  topOverlay?: ReactNode;
}

export function DesignFileCard({
  fileName,
  viewedAtIso,
  thumbnailUrl,
  onClick,
  onKeyDown,
  isActive = false,
  menu,
  topOverlay,
}: Props) {
  const overlay = menu ? <DesignFileCardOverflowMenu {...menu} /> : topOverlay;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        'group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 text-left shadow-sm',
        'transition-colors hover:border-stone-400/80 hover:bg-white',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900',
        isActive && 'ring-2 ring-inset ring-stone-900/10'
      )}
    >
      {overlay}
      <div className="relative h-24 w-full shrink-0 overflow-hidden bg-stone-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
              const sib = (e.target as HTMLImageElement).nextElementSibling;
              if (sib instanceof HTMLElement) sib.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-stone-400',
            thumbnailUrl ? 'hidden' : 'flex'
          )}
          aria-hidden
        >
          <ImageOff className="h-8 w-8" strokeWidth={1.25} />
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
        <span className="truncate text-sm font-semibold text-stone-900">{fileName}</span>
        <span className="text-xs text-stone-500">Viewed {formatViewedAt(viewedAtIso)}</span>
      </div>
    </div>
  );
}
