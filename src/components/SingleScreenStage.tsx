import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ScreenFrame } from '../types';
import { Button } from '@/components/ui/button';
import { sanitizePageNavLabel } from '@/lib/pageNavLabel';

interface Props {
  screen: ScreenFrame;
  positionLabel: string;
}

export function SingleScreenStage({ screen, positionLabel }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const pageLabel = sanitizePageNavLabel(screen.pageName) || screen.pageName;

  return (
    <div className="flex w-full min-h-[min(70vh,720px)] flex-col items-center justify-center gap-6 py-8">
      <div className="flex w-full flex-col items-center gap-3 self-stretch text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="min-w-0 flex-1">
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl" title={screen.name}>
            {screen.name}
          </h2>
          <p className="mt-1 truncate text-sm text-muted-foreground" title={screen.pageName}>
            {pageLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs tabular-nums text-muted-foreground">
            {positionLabel}
          </span>
          <Button size="lg" className="gap-2 rounded-full" asChild>
            <a href={screen.protoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open prototype
            </a>
          </Button>
        </div>
      </div>

      <div className="relative inline-flex max-h-[min(78vh,860px)] max-w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg">
        {!imgError && screen.thumbnailUrl ? (
          <>
            {!imgLoaded && (
              <div
                className="absolute inset-0 min-h-[min(50vh,400px)] min-w-[200px] animate-pulse bg-muted sm:min-w-[280px]"
                aria-hidden
              />
            )}
            <img
              src={screen.thumbnailUrl}
              alt={screen.name}
              className={`max-h-[min(78vh,860px)] w-auto max-w-full object-contain transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="flex min-h-[min(40vh,360px)] min-w-[280px] items-center justify-center bg-muted/50 text-muted-foreground sm:min-w-[360px]">
            <span className="text-4xl opacity-40">◻</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Use <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>{' '}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↓</kbd> to move
        between screens
      </p>
    </div>
  );
}
