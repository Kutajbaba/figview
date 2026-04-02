import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { parseFigmaUrl } from '@/lib/figma';
import { TOKEN_KEY } from '@/lib/figviewStorageKeys';
import type { FigmaConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onLoad: (config: FigmaConfig) => void | Promise<boolean>;
  loading: boolean;
  error: string | null;
  progress: string;
  /** Compact layout for dialogs (no fixed height / absolute layering). */
  variant?: 'page' | 'modal';
  /** Pre-filled file URL (e.g. opened from a shared view link). */
  initialFileUrl?: string;
  /** Rendered at top of modal card (e.g. title + close). */
  header?: ReactNode;
}

export function LoadFileFormCard({
  onLoad,
  loading,
  error,
  progress,
  variant = 'page',
  initialFileUrl = '',
  header,
}: Props) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved ?? '';
  });
  const [url, setUrl] = useState(initialFileUrl);
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

  const form = (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <Label htmlFor={variant === 'modal' ? 'load-token-modal' : 'load-token'} className="text-stone-700">
                Figma personal access token
              </Label>
              <Input
                id={variant === 'modal' ? 'load-token-modal' : 'load-token'}
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
              <Label htmlFor={variant === 'modal' ? 'load-url-modal' : 'load-url'} className="text-stone-700">
                Figma file URL
              </Label>
              <Input
                id={variant === 'modal' ? 'load-url-modal' : 'load-url'}
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
              {loading ? progress || 'Loading…' : 'Try demo'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
    </form>
  );

  if (variant === 'modal') {
    return (
      <Card className="w-full border-stone-200/80 bg-white/95 shadow-none">
        <CardContent className="p-6 sm:p-8">
          {header ? <div className="mb-6 border-b border-stone-100 pb-0">{header}</div> : null}
          {form}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative mx-auto mt-12 flex w-[40%] max-w-full flex-col gap-0">
      <Card className="relative z-[2] min-h-[20rem] w-full border-stone-200/80 bg-white/90 shadow-xl shadow-stone-900/5 backdrop-blur-md">
        <CardContent className="absolute inset-0 flex flex-col overflow-y-auto p-6 sm:p-8">{form}</CardContent>
      </Card>
    </div>
  );
}
