import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ScreenFrame } from '../types';
import { cn } from '@/lib/utils';

interface Props {
  screen: ScreenFrame;
  index: number;
}

export function ScreenCard({ screen, index }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    window.open(screen.protoUrl, '_blank', 'noopener');
  };

  const aspect = screen.kind === 'mobile' ? 'aspect-[9/16]' : 'aspect-video';

  return (
    <article
      className="group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${Math.min(index, 20) * 35}ms` } as CSSProperties}
      onClick={handleClick}
      title={`Open prototype: ${screen.name}`}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200',
          'group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md',
          aspect
        )}
      >
        {!imgError && screen.thumbnailUrl ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <img
              src={screen.thumbnailUrl}
              alt={screen.name}
              className={cn('h-full w-full object-contain transition-opacity duration-300', imgLoaded ? 'opacity-100' : 'opacity-0')}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
            <span className="text-2xl opacity-40">◻</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/40 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg">
            <ExternalLink className="h-4 w-4" />
            Open
          </span>
        </div>
      </div>
      <p className="mt-3 truncate text-sm font-medium text-foreground" title={screen.name}>
        {screen.name}
      </p>
      <p className="truncate text-xs text-muted-foreground" title={screen.pageName}>
        {screen.pageName}
      </p>
    </article>
  );
}
