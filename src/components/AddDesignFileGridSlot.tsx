import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type { AddDesignFileProps } from '@/components/AddDesignFileModal';

interface Props {
  onOpen: () => void;
}

export function AddDesignFileGridSlot({ onOpen }: Props) {
  return (
    <li className="h-full min-h-0 min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          'flex h-full w-full max-w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-stone-200/90 bg-white px-2 text-center text-[12px] font-semibold leading-snug text-stone-900',
          'transition-colors hover:border-stone-400/80',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900'
        )}
      >
        <Plus className="size-7 shrink-0 text-stone-600" strokeWidth={1.75} aria-hidden />
        Add Design File
      </div>
    </li>
  );
}
