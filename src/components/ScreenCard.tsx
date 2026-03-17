import { useState } from 'react';
import type { ScreenFrame } from '../types';

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

  return (
    <article
      className="screen-card"
      onClick={handleClick}
      style={{ '--delay': `${index * 30}ms` } as React.CSSProperties}
      title={`Jump to: ${screen.name}`}
    >
      <div className="screen-thumb">
        {!imgError && screen.thumbnailUrl ? (
          <>
            {!imgLoaded && <div className="thumb-skeleton" />}
            <img
              src={screen.thumbnailUrl}
              alt={screen.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          </>
        ) : (
          <div className="thumb-placeholder">
            <span className="thumb-placeholder-icon">⬜</span>
          </div>
        )}
        <div className="screen-overlay">
          <span className="overlay-cta">Open in Prototype ↗</span>
        </div>
      </div>
      <div className="screen-meta">
        <span className="screen-name">{screen.name}</span>
        <span className="screen-page">{screen.pageName}</span>
      </div>
    </article>
  );
}
