import { useState, type FormEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { TOKEN_KEY } from '@/lib/figviewStorageKeys';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  fileName: string;
  fileKey: string;
}

export function AccountPage({ fileName, fileKey }: Props) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [saved, setSaved] = useState(false);

  const onSaveToken = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem(TOKEN_KEY, token.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your token stays in this browser. Update it here if you rotate your Figma personal access token.
        </p>

        <Card className="mt-8 border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Figma access token</CardTitle>
            <CardDescription>
              Create or manage tokens in Figma settings. Figview never sends your token to our servers — only to
              Figma&apos;s API from your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveToken} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="acct-token">Personal access token</Label>
                <Input
                  id="acct-token"
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="figd_…"
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="default">
                  Save token
                </Button>
                {saved && <span className="text-sm text-muted-foreground">Saved locally.</span>}
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://help.figma.com/hc/en-us/articles/8085703771063-Manage-personal-access-tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    Figma token docs
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Current session</CardTitle>
            <CardDescription>From the file you last loaded successfully in this tab.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">File name · </span>
              <span className="font-medium">{fileName || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">File key · </span>
              <span className="break-all font-mono text-xs">{fileKey || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
