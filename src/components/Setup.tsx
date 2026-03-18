import { useState } from 'react';
import { parseFigmaUrl } from '../lib/figma';
import type { FigmaConfig } from '../types';

interface Props {
  onLoad: (config: FigmaConfig) => void;
  loading: boolean;
  error: string | null;
}

const TOKEN_KEY = 'figview:token';

export function Setup({ onLoad, loading, error }: Props) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved ?? '';
  });
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    const parsed = parseFigmaUrl(url.trim());
    if (!parsed) {
      setUrlError('Invalid Figma URL. Paste a /file/, /design/, or /proto/ link.');
      return;
    }

    localStorage.setItem(TOKEN_KEY, token.trim());
    onLoad({ token: token.trim(), fileKey: parsed.fileKey, rawUrl: url.trim() });
  };

  return (
    <div className="setup">
      <div className="setup-card">
        <div className="setup-eyebrow">— prototype navigator</div>
        <h1 className="setup-title">figview</h1>
        <p className="setup-subtitle">
          Paste any Figma file and jump to any screen instantly — no clicking through flows.
        </p>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="field">
            <label htmlFor="token">Figma Personal Access Token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="figd_…"
              required
              autoComplete="off"
              spellCheck={false}
            />
            <span className="field-hint">
              Get one at figma.com → Account Settings → Personal Access Tokens
            </span>
          </div>

          <div className="field">
            <label htmlFor="url">Figma File URL</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setUrlError(''); }}
              placeholder="https://www.figma.com/file/…"
              required
              spellCheck={false}
            />
            {urlError && <span className="field-error">{urlError}</span>}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" disabled={loading} className="btn-load">
            {loading ? 'Loading…' : 'Load Screens →'}
          </button>
        </form>
      </div>
    </div>
  );
}
