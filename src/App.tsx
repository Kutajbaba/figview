import { Setup } from './components/Setup';
import { ScreenGrid } from './components/ScreenGrid';
import { DashboardShell } from './components/DashboardShell';
import { Loader } from './components/Loader';
import { useFigmaFile } from './hooks/useFigmaFile';
import './index.css';

export default function App() {
  const { load, loading, error, screens, fileName, progress, reset } = useFigmaFile();

  if (screens.length > 0) {
    return (
      <>
        {loading && <Loader message={progress || 'Loading…'} />}
        <DashboardShell fileName={fileName} screenCount={screens.length} onNewFile={reset}>
          <ScreenGrid screens={screens} fileName={fileName} />
        </DashboardShell>
      </>
    );
  }

  return (
    <>
      {loading && <Loader message={progress || 'Loading…'} />}
      <Setup onLoad={load} loading={loading} error={error} progress={progress} fileName={fileName} />
    </>
  );
}
