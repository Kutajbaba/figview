import { useState } from 'react';
import type { CSSProperties } from 'react';
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
      data-kind={screen.kind}
      onClick={handleClick}
      style={{ '--delay': `${index * 30}ms` } as CSSProperties}
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

        <div className="thumb-bottom">
          <div className="thumb-title" title={screen.name}>
            {screen.name}
          </div>
          <div className="thumb-page">{screen.pageName}</div>
        </div>

        <div className="screen-overlay">
          <span className="overlay-cta">View Prototype ↗</span>
        </div>
      </div>
    </article>
  );
}
