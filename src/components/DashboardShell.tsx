import type { ReactNode } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
  fileName: string;
  screenCount: number;
  onNewFile: () => void;
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ fileName, screenCount, onNewFile, children, className }: Props) {
  return (
    <div className={cn('flex min-h-screen bg-background', className)}>
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-card px-4 py-6">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Figview</span>
        </div>

        <Separator className="my-6" />

        <div className="px-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current file</p>
          <p className="mt-1 line-clamp-3 text-sm font-medium leading-snug" title={fileName}>
            {fileName || 'Untitled'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{screenCount} screens indexed</p>
        </div>

        <div className="mt-auto space-y-2 px-2 pb-2">
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={onNewFile}>
            <Plus className="h-4 w-4" />
            New file
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
