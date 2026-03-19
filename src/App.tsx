import { useMemo, useState } from 'react';
import { Setup } from './components/Setup';
import { ScreenGrid } from './components/ScreenGrid';
import { DashboardShell } from './components/DashboardShell';
import { Loader } from './components/Loader';
import { useFigmaFile } from './hooks/useFigmaFile';
import type { ScreenFrame } from './types';
import './index.css';

function FigviewDashboard({
  screens,
  fileName,
  reset,
  loading,
  progress,
}: {
  screens: ScreenFrame[];
  fileName: string;
  reset: () => void;
  loading: boolean;
  progress: string;
}) {
  const [activePage, setActivePage] = useState<string>('__all__');

  const pages = useMemo(() => {
    const set = new Set(screens.map(s => s.pageName));
    return Array.from(set);
  }, [screens]);

  return (
    <>
      {loading && <Loader message={progress || 'Loading…'} />}
      <DashboardShell
        fileName={fileName}
        screenCount={screens.length}
        onNewFile={reset}
        pages={pages}
        activePage={activePage}
        onPageChange={setActivePage}
      >
        <ScreenGrid screens={screens} activePage={activePage} />
      </DashboardShell>
    </>
  );
}

export default function App() {
  const { load, loading, error, screens, fileName, progress, reset } = useFigmaFile();

  if (screens.length > 0) {
    return (
      <FigviewDashboard
        key={fileName}
        screens={screens}
        fileName={fileName}
        reset={reset}
        loading={loading}
        progress={progress}
      />
    );
  }

  return (
    <>
      {loading && <Loader message={progress || 'Loading…'} />}
      <Setup onLoad={load} loading={loading} error={error} progress={progress} fileName={fileName} />
    </>
  );
}
