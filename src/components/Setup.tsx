import { useState, type FormEvent } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { parseFigmaUrl } from '../lib/figma';
import type { RecentDesignRecord } from '@/lib/recentDesigns';
import type { FigmaConfig } from '../types';
import { RecentDesignsSection } from './RecentDesignsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
  onLoad: (config: FigmaConfig) => void;
  loading: boolean;
  error: string | null;
  progress: string;
  fileName: string;
}

const TOKEN_KEY = 'figview:token';

export function Setup({ onLoad, loading, error, progress, fileName }: Props) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved ?? '';
  });
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUrlError('');

    const parsed = parseFigmaUrl(url.trim());
    if (!parsed) {
      setUrlError('Invalid Figma URL. Use a /file/, /design/, or /proto/ link.');
      return;
    }

    localStorage.setItem(TOKEN_KEY, token.trim());
    onLoad({ token: token.trim(), fileKey: parsed.fileKey, rawUrl: url.trim() });
  };

  const handleOpenRecent = (entry: RecentDesignRecord) => {
    setUrl(entry.rawUrl);
    const saved = localStorage.getItem(TOKEN_KEY) ?? '';
    if (saved.trim()) {
      onLoad({ token: saved.trim(), fileKey: entry.fileKey, rawUrl: entry.rawUrl });
    }
  };

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        'bg-gradient-to-b from-[#FDF8F1] via-[#FAF4EC] to-[#F3EBE0] text-[#1c1917]'
      )}
    >
      {/* subtle bottom texture */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #78716c 1px, transparent 0)`,
          backgroundSize: '14px 14px',
          maskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />

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

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-24 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-ibmPlexMono text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-[56px] sm:leading-[1.1]">
            Figma designs at glance
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
            Navigate and present figma designs with confidence
          </p>

          {fileName && (
            <p className="mt-4 text-sm text-stone-500">
              Last loaded: <span className="font-medium text-stone-700">{fileName}</span>
            </p>
          )}
        </div>

        <div className="relative mx-auto mt-12 flex w-[40%] max-w-full flex-col gap-0">
          <Card className="relative z-[2] min-h-[20rem] w-full border-stone-200/80 bg-white/90 shadow-xl shadow-stone-900/5 backdrop-blur-md">
            <CardContent className="absolute inset-0 flex flex-col overflow-y-auto p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-stone-700">
                    Figma personal access token
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="figd_…"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    className="border-stone-200 bg-white"
                  />
                  <p className="text-xs text-stone-500">Stored locally in your browser only.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-stone-700">
                    Figma file URL
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={e => {
                      setUrl(e.target.value);
                      setUrlError('');
                    }}
                    placeholder="https://www.figma.com/design/…"
                    required
                    spellCheck={false}
                    className="border-stone-200 bg-white"
                  />
                  {urlError && <p className="text-sm text-red-600">{urlError}</p>}
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  size="pill"
                  className="w-full bg-stone-900 text-white hover:bg-stone-800"
                >
                  {loading ? progress || 'Loading…' : 'Get started'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <RecentDesignsSection onOpenRecent={handleOpenRecent} embedded />
        </div>
      </div>
    </div>
  );
}
