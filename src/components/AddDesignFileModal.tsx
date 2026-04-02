import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { FigmaConfig } from '@/types';
import { LoadFileFormCard } from '@/components/LoadFileFormCard';
import { Button } from '@/components/ui/button';

export interface AddDesignFileProps {
  onLoad: (config: FigmaConfig) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  progress: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addDesignFile: AddDesignFileProps;
}

export function AddDesignFileModal({ open, onOpenChange, addDesignFile }: Props) {
  const handleModalLoad = useCallback(
    async (config: FigmaConfig) => {
      const ok = await addDesignFile.onLoad(config);
      if (ok) onOpenChange(false);
      return ok;
    },
    [addDesignFile, onOpenChange]
  );

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-design-file-title"
      onClick={() => onOpenChange(false)}
    >
      <div className="relative z-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <LoadFileFormCard
          variant="modal"
          {...addDesignFile}
          onLoad={handleModalLoad}
          header={
            <div className="flex h-fit items-center justify-between gap-3">
              <h2 id="add-design-file-title" className="text-lg font-semibold tracking-tight text-stone-900">
                Add Figma file
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-stone-600 hover:text-stone-900"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" strokeWidth={1.75} aria-hidden />
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
