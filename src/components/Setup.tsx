import { Sparkles } from 'lucide-react';
import type { FigmaConfig } from '../types';
import { HomeMarketingShell } from './HomeMarketingShell';
import { MarketingHero } from './MarketingHero';
import { LoadFileFormCard } from './LoadFileFormCard';
import { Button } from '@/components/ui/button';

interface Props {
  onLoad: (config: FigmaConfig) => void | Promise<boolean>;
  loading: boolean;
  error: string | null;
  progress: string;
  fileName: string;
  initialFileUrl?: string;
}

export function Setup({ onLoad, loading, error, progress, fileName, initialFileUrl }: Props) {
  return (
    <HomeMarketingShell className="min-h-screen">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pb-8 pt-10 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Figview</span>
        </div>
        <Button
          variant="outline"
          size="pill-sm"
          className="hidden rounded-full border-stone-300 bg-white/80 text-stone-900 shadow-sm backdrop-blur sm:inline-flex"
          type="button"
        >
          Log in
        </Button>
      </header>

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-24 pt-12 sm:px-8">
        <MarketingHero fileName={fileName || undefined} />
        <LoadFileFormCard
          onLoad={onLoad}
          loading={loading}
          error={error}
          progress={progress}
          initialFileUrl={initialFileUrl}
        />
      </div>
    </HomeMarketingShell>
  );
}
