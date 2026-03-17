import { useState } from 'react';
import { Setup } from './components/Setup';
import { ScreenGrid } from './components/ScreenGrid';
import { Loader } from './components/Loader';
import { useFigmaFile } from './hooks/useFigmaFile';
import type { FigmaConfig } from './types';
import './index.css';

type View = 'setup' | 'grid';

export default function App() {
  const [view, setView] = useState<View>('setup');
  const { load, loading, error, screens, fileName, progress } = useFigmaFile();

  const handleLoad = async (config: FigmaConfig) => {
    await load(config);
    setView('grid');
  };

  const effectiveView: View = view === 'grid' && screens.length > 0 ? 'grid' : 'setup';

  return (
    <main className="app">
      {loading && <Loader message={progress} />}

      {!loading && effectiveView === 'setup' && (
        <Setup onLoad={handleLoad} loading={loading} error={error} />
      )}

      {!loading && effectiveView === 'grid' && (
        <ScreenGrid
          screens={screens}
          fileName={fileName}
          onReset={() => setView('setup')}
        />
      )}
    </main>
  );
}
