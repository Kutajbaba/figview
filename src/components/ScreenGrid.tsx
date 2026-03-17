import { useState, useMemo } from 'react';
import { ScreenCard } from './ScreenCard';
import type { ScreenFrame } from '../types';

interface Props {
  screens: ScreenFrame[];
  fileName: string;
  onReset: () => void;
}

export function ScreenGrid({ screens, fileName, onReset }: Props) {
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState<string>('__all__');

  const pages = useMemo(() => {
    const set = new Set(screens.map(s => s.pageName));
    return Array.from(set);
  }, [screens]);

  const filtered = useMemo(() => {
    let result = screens;
    if (activePage !== '__all__') result = result.filter(s => s.pageName === activePage);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [screens, activePage, search]);

  return (
    <div className="grid-view">
      <header className="grid-header">
        <div className="grid-header-left">
          <button className="btn-back" onClick={onReset}>← Back</button>
          <div className="grid-title-block">
            <span className="grid-eyebrow">figview</span>
            <h1 className="grid-filename">{fileName}</h1>
          </div>
        </div>
        <div className="grid-header-right">
          <span className="screen-count">{filtered.length} screens</span>
        </div>
      </header>

      <div className="grid-controls">
        <input
          className="search-input"
          type="search"
          placeholder="Search screens…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="page-tabs">
          <button
            className={`page-tab ${activePage === '__all__' ? 'active' : ''}`}
            onClick={() => setActivePage('__all__')}
          >
            All pages
          </button>
          {pages.map(p => (
            <button
              key={p}
              className={`page-tab ${activePage === p ? 'active' : ''}`}
              onClick={() => setActivePage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No screens match "{search}"</div>
      ) : (
        <div className="screen-grid">
          {filtered.map((screen, i) => (
            <ScreenCard key={screen.id} screen={screen} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
