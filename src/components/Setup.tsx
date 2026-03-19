import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ClipboardList,
  LayoutGrid,
  MousePointerClick,
  Share2,
  Sparkles,
} from 'lucide-react';
import { parseFigmaUrl } from '../lib/figma';
import type { FigmaConfig } from '../types';
import { Badge } from '@/components/ui/badge';
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

const benefits = [
  {
    title: 'Instant Overview',
    description:
      'See all prototype screens in one grid view — no more clicking through flows or panning around your file.',
    icon: LayoutGrid,
    gridClass:
      'md:col-span-7 md:col-start-1 md:row-start-1 md:translate-y-0',
    delay: '0ms',
  },
  {
    title: 'Jump Anywhere',
    description:
      'Click any thumbnail to start your prototype from that exact screen. Skip the sequential navigation.',
    icon: MousePointerClick,
    gridClass:
      'md:col-span-5 md:col-start-8 md:row-start-1 md:translate-y-10',
    delay: '60ms',
  },
  {
    title: 'Fast Research Setup',
    description:
      'Perfect for usability testing. Find and jump to any test scenario in seconds, not minutes.',
    icon: ClipboardList,
    gridClass:
      'md:col-span-5 md:col-start-1 md:row-start-2 md:-translate-y-4',
    delay: '120ms',
  },
  {
    title: 'Share Custom Views',
    description:
      'Reorder frames for your workflow and share the exact layout with teammates via URL.',
    icon: Share2,
    gridClass:
      'md:col-span-7 md:col-start-6 md:row-start-2 md:translate-y-6',
    delay: '180ms',
  },
] as const;

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
        <nav className="hidden items-center gap-10 text-sm font-medium text-stone-600 md:flex" aria-label="Marketing">
          <span className="cursor-default">How it works</span>
          <span className="cursor-default">Prototype links</span>
        </nav>
        <Button
          variant="outline"
          size="pill-sm"
          className="hidden rounded-full border-stone-300 bg-white/80 text-stone-900 shadow-sm backdrop-blur sm:inline-flex"
          type="button"
        >
          Log in
        </Button>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="sand" className="mb-6 shadow-sm">
            Open any Figma file — jump to any top-level frame
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.1]">
            Where screens emerge, <span className="text-stone-600">in one glance.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
            Paste your personal access token and file URL. We&apos;ll fetch every screen thumbnail so you can browse like a
            pattern library — then open the prototype at the right node.
          </p>

          {fileName && (
            <p className="mt-4 text-sm text-stone-500">
              Last loaded: <span className="font-medium text-stone-700">{fileName}</span>
            </p>
          )}
        </div>

        <Card className="mx-auto mt-12 w-full max-w-[22rem] border-stone-200/80 bg-white/90 shadow-xl shadow-stone-900/5 backdrop-blur-md">
          <CardContent className="p-6 sm:p-8">
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

        {/* Bento benefits — wider than form card */}
        <section
          className="mx-auto mt-20 w-full max-w-5xl text-left"
          aria-labelledby="benefits-heading"
        >
          <h2
            id="benefits-heading"
            className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-stone-500"
          >
            Why teams use Figview
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 md:pb-8">
            {benefits.map(
              ({ title, description, icon: Icon, gridClass, delay }) => (
                <Card
                  key={title}
                  className={cn(
                    'group border border-stone-300/55 bg-transparent shadow-none backdrop-blur-none transition-colors duration-200',
                    'hover:border-stone-400/70',
                    'animate-fade-in',
                    gridClass
                  )}
                  style={{ animationDelay: delay }}
                >
                  <CardContent className="flex h-full flex-col gap-4 p-6 sm:p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300/60 bg-transparent text-stone-700">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
