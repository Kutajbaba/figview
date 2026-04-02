import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { RecentDesignRecord } from '@/lib/recentDesigns';
import { getRecentDesigns, removeRecentDesign, shareRecentDesign } from '@/lib/recentDesigns';
import { AddDesignFileModal, type AddDesignFileProps } from '@/components/AddDesignFileModal';
import { AddDesignFileGridSlot } from '@/components/AddDesignFileGridSlot';
import { DesignFileCard } from '@/components/DesignFileCard';
import { HomeMarketingShell } from '@/components/HomeMarketingShell';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const RECENT_CHANGED = 'figview:recent-changed';

function ensureCurrentInList(
  items: RecentDesignRecord[],
  current: { fileKey: string; fileName: string; thumb: string | null }
): RecentDesignRecord[] {
  if (!current.fileKey) return items;
  if (items.some(i => i.fileKey === current.fileKey)) return items;
  const rawUrl = `https://www.figma.com/design/${current.fileKey}`;
  const insert: RecentDesignRecord = {
    fileKey: current.fileKey,
    fileName: current.fileName,
    rawUrl,
    thumbnailUrl: current.thumb,
    viewedAt: new Date().toISOString(),
  };
  return [insert, ...items];
}

interface Props {
  currentFileKey: string;
  currentFileName: string;
  currentThumbnailUrl: string | null;
  onOpenFile: (entry: RecentDesignRecord) => void;
  addDesignFile?: AddDesignFileProps;
}

export function DesignsBrowsePage({
  currentFileKey,
  currentFileName,
  currentThumbnailUrl,
  onOpenFile,
  addDesignFile,
}: Props) {
  const [items, setItems] = useState<RecentDesignRecord[]>(() => getRecentDesigns());
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getRecentDesigns());
    window.addEventListener(RECENT_CHANGED, sync);
    return () => window.removeEventListener(RECENT_CHANGED, sync);
  }, []);

  const displayItems = useMemo(() => {
    const merged = ensureCurrentInList(items, {
      fileKey: currentFileKey,
      fileName: currentFileName,
      thumb: currentThumbnailUrl,
    });
    const seen = new Set<string>();
    return merged.filter(entry => {
      if (seen.has(entry.fileKey)) return false;
      seen.add(entry.fileKey);
      return true;
    });
  }, [items, currentFileKey, currentFileName, currentThumbnailUrl]);

  const onKeyOpen = useCallback(
    (e: KeyboardEvent, entry: RecentDesignRecord) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenFile(entry);
      }
    },
    [onOpenFile]
  );

  return (
    <HomeMarketingShell className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 py-10 sm:px-8">
        <section aria-labelledby="designs-browse-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <header className="max-w-2xl min-w-0">
              <h1
                id="designs-browse-heading"
                className="font-ibmPlexMono text-lg font-semibold tracking-tight text-stone-900"
              >
                Designs
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Files you&apos;ve opened in Figview. Select a file to open its screen grid.
              </p>
            </header>
            {addDesignFile ? (
              <Button
                type="button"
                variant="default"
                className="shrink-0 self-start sm:mt-0"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="size-4" aria-hidden />
                Add design file
              </Button>
            ) : null}
          </div>

          {addDesignFile ? (
            <AddDesignFileModal
              open={addModalOpen}
              onOpenChange={setAddModalOpen}
              addDesignFile={addDesignFile}
            />
          ) : null}

          {displayItems.length === 0 && !addDesignFile ? (
            <p className="py-16 text-center text-stone-600">No design files in this browser yet.</p>
          ) : (
            <ul className="mt-8 grid auto-rows-[170px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map(entry => (
                <li key={entry.fileKey} className="h-full min-h-0 min-w-0">
                  <DesignFileCard
                    fileName={entry.fileName}
                    viewedAtIso={entry.viewedAt}
                    thumbnailUrl={entry.thumbnailUrl}
                    onClick={() => onOpenFile(entry)}
                    onKeyDown={e => onKeyOpen(e, entry)}
                    isActive={entry.fileKey === currentFileKey}
                    menu={{
                      onRemove: () => removeRecentDesign(entry.fileKey),
                      onShare: () => void shareRecentDesign(entry),
                    }}
                  />
                </li>
              ))}
              {addDesignFile ? (
                <AddDesignFileGridSlot key="__add-design-file" onOpen={() => setAddModalOpen(true)} />
              ) : null}
            </ul>
          )}
        </section>
      </div>
    </HomeMarketingShell>
  );
}
