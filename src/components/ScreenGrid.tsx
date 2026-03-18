import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
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
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [mobileColumns, setMobileColumns] = useState<number>(4);
  const [desktopColumns, setDesktopColumns] = useState<number>(3);
  const columns = device === 'mobile' ? mobileColumns : desktopColumns;

  const pages = useMemo(() => {
    const set = new Set(screens.map(s => s.pageName));
    return Array.from(set);
  }, [screens]);

  const filtered = useMemo(() => {
    let result = screens;
    result = result.filter(s => s.kind === device);
    if (activePage !== '__all__') result = result.filter(s => s.pageName === activePage);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [screens, device, activePage, search]);

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

        <div className="device-tabs">
          <button
            className={`device-tab page-tab ${device === 'mobile' ? 'active' : ''}`}
            onClick={() => setDevice('mobile')}
          >
            Mobile
          </button>
          <button
            className={`device-tab page-tab ${device === 'desktop' ? 'active' : ''}`}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </button>
        </div>

        <div className="columns-control">
          <div className="columns-top">
            <span className="columns-label">Columns ({device})</span>
            <span className="columns-value">{columns}</span>
          </div>
          <input
            className="columns-range"
            type="range"
            min={1}
            max={6}
            step={1}
            value={columns}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (device === 'mobile') setMobileColumns(v);
              else setDesktopColumns(v);
            }}
            aria-label="Columns per row"
          />
          <div className="columns-hint">Adjust gallery density</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No screens match "{search}"</div>
      ) : (
        <div
          className="screen-grid"
          style={{ '--columns': columns } as CSSProperties}
        >
          {filtered.map((screen, i) => (
            <ScreenCard key={screen.id} screen={screen} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
