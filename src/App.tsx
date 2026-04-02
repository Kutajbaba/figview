import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Link2, Presentation } from 'lucide-react';
import { Setup } from './components/Setup';
import { ScreenGrid } from './components/ScreenGrid';
import { AppShell, type AppSection } from './components/AppShell';
import { AddDesignFileModal } from './components/AddDesignFileModal';
import { PostLoadModal, type PostLoadChoice } from './components/PostLoadModal';
import { DashboardPage } from './components/DashboardPage';
import { DesignsBrowsePage } from './components/DesignsBrowsePage';
import { AccountPage } from './components/AccountPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { Loader } from './components/Loader';
import { Button } from './components/ui/button';
import { useFigmaFile } from './hooks/useFigmaFile';
import {
  hasSeenPostLoadModal,
  markPostLoadModalSeen,
  readInitialAppSectionFromSession,
  TOKEN_KEY,
} from './lib/figviewStorageKeys';
import type { RecentDesignRecord } from './lib/recentDesigns';
import {
  mergeOrderWithScreens,
  readStoredScreenOrder,
  sortScreensByOrder,
  writeStoredScreenOrder,
} from './lib/screenLayout';
import { buildMinimalFigmaDesignUrl, buildShareViewUrl, readShareParamsFromLocation } from './lib/shareLink';
import type { FigmaConfig, ScreenFrame } from './types';
import { PresentationModeOverlay } from './components/PresentationModeOverlay';
import './index.css';

function initialShellSection(): AppSection {
  const base = readInitialAppSectionFromSession();
  return base === 'designs' ? 'designs' : 'dashboard';
}

type DesignsPhase = 'browse' | 'grid';

interface FigviewAppProps {
  screens: ScreenFrame[];
  fileName: string;
  fileKey: string;
  loading: boolean;
  progress: string;
  error: string | null;
  load: (config: FigmaConfig) => Promise<boolean>;
  reset: () => void;
  shareBootstrapOrder: string[] | null;
  isShareViewer: boolean;
}

function FigviewApp({
  screens,
  fileName,
  fileKey,
  loading,
  progress,
  error,
  load,
  reset: _reset,
  shareBootstrapOrder,
  isShareViewer,
}: FigviewAppProps) {
  const [pageSelection, setPageSelection] = useState<Record<string, string>>({});
  const [appSection, setAppSection] = useState<AppSection>(() =>
    isShareViewer ? 'designs' : initialShellSection()
  );
  const [designsPhase, setDesignsPhase] = useState<DesignsPhase>(() => (isShareViewer ? 'grid' : 'browse'));
  const [screenOrder, setScreenOrder] = useState<string[]>(() =>
    mergeOrderWithScreens(shareBootstrapOrder ?? readStoredScreenOrder(fileKey), screens)
  );
  const [shareLinkFeedback, setShareLinkFeedback] = useState<'idle' | 'copied'>('idle');
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [shellAddFileOpen, setShellAddFileOpen] = useState(false);

  const displayOrder = useMemo(() => mergeOrderWithScreens(screenOrder, screens), [screenOrder, screens]);

  const orderedScreens = useMemo(
    () => sortScreensByOrder(screens, displayOrder),
    [screens, displayOrder]
  );

  const persistScreenOrder = useCallback(
    (next: string[]) => {
      setScreenOrder(next);
      writeStoredScreenOrder(fileKey, next);
    },
    [fileKey]
  );

  const handleCopyShareLink = useCallback(async () => {
    const order = displayOrder.length > 0 ? displayOrder : screens.map(s => s.id);
    const url = buildShareViewUrl({ fileKey, order });
    try {
      await navigator.clipboard.writeText(url);
      setShareLinkFeedback('copied');
      window.setTimeout(() => setShareLinkFeedback('idle'), 2000);
    } catch {
      setShareLinkFeedback('idle');
    }
  }, [fileKey, displayOrder, screens]);

  const activePage = pageSelection[fileKey] ?? '__all__';
  const setActivePage = useCallback(
    (pageId: string) => {
      setPageSelection(prev => ({ ...prev, [fileKey]: pageId }));
    },
    [fileKey]
  );

  const presentationScreens = useMemo(() => {
    if (activePage === '__all__') return orderedScreens;
    return orderedScreens.filter(s => s.pageName === activePage);
  }, [orderedScreens, activePage]);

  const pages = useMemo(() => {
    const set = new Set(screens.map(s => s.pageName));
    return Array.from(set);
  }, [screens]);

  const showPostLoadModal =
    screens.length > 0 && !isShareViewer && !hasSeenPostLoadModal();

  const handlePostLoadChoice = useCallback((choice: PostLoadChoice) => {
    markPostLoadModalSeen(choice === 'designs' ? 'designs' : 'explore');
    if (choice === 'designs') {
      setDesignsPhase('grid');
      setAppSection('designs');
    } else {
      setAppSection('dashboard');
    }
  }, []);

  const handleSectionChange = useCallback(
    (section: AppSection) => {
      if (isShareViewer) return;
      if (section === 'designs') setDesignsPhase('browse');
      setAppSection(section);
    },
    [isShareViewer]
  );

  const handleNewFile = useCallback(() => {
    setShellAddFileOpen(true);
  }, []);

  const loadFromShellModal = useCallback(
    async (config: FigmaConfig) => {
      const ok = await load(config);
      if (ok) {
        setAppSection('designs');
        setDesignsPhase('grid');
        setPageSelection({});
      }
      return ok;
    },
    [load]
  );

  const handleDesignFileSelect = useCallback(
    async (entry: RecentDesignRecord) => {
      const saved = localStorage.getItem(TOKEN_KEY) ?? '';
      if (!saved.trim()) return;
      if (entry.fileKey !== fileKey) {
        const ok = await load({
          token: saved.trim(),
          fileKey: entry.fileKey,
          rawUrl: entry.rawUrl,
        });
        if (!ok) return;
      }
      setDesignsPhase('grid');
    },
    [load, fileKey]
  );

  const currentFileThumb = useMemo(() => {
    const withThumb = screens.find(s => s.thumbnailUrl);
    return withThumb?.thumbnailUrl ?? null;
  }, [screens]);

  const addDesignFile = useMemo(
    () => ({ onLoad: load, loading, error, progress }),
    [load, loading, error, progress]
  );

  const addDesignFileShell = useMemo(
    () => ({ onLoad: loadFromShellModal, loading, error, progress }),
    [loadFromShellModal, loading, error, progress]
  );

  return (
    <>
      {loading && <Loader message={progress || 'Loading…'} />}
      <PostLoadModal
        open={showPostLoadModal}
        fileName={fileName}
        screenCount={screens.length}
        onChoose={handlePostLoadChoice}
      />
      {!isShareViewer && (
        <AddDesignFileModal
          open={shellAddFileOpen}
          onOpenChange={setShellAddFileOpen}
          addDesignFile={addDesignFileShell}
        />
      )}
      <AppShell
        activeSection={appSection}
        onSectionChange={handleSectionChange}
        screenCount={screens.length}
        pages={pages}
        activePage={activePage}
        onPageChange={setActivePage}
        onNewFile={handleNewFile}
        shareViewer={isShareViewer}
        figmaPageNavVisible={false}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {error && (
            <div
              className="shrink-0 border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-900 sm:px-8"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {appSection === 'dashboard' && <DashboardPage />}
            {appSection === 'designs' && designsPhase === 'browse' && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <DesignsBrowsePage
                  currentFileKey={fileKey}
                  currentFileName={fileName}
                  currentThumbnailUrl={currentFileThumb}
                  onOpenFile={handleDesignFileSelect}
                  addDesignFile={addDesignFile}
                />
              </div>
            )}
            {appSection === 'designs' && designsPhase === 'grid' && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-md sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isShareViewer && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setDesignsPhase('browse')}
                      >
                        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                        All designs
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full"
                      disabled={presentationScreens.length === 0}
                      onClick={() => setPresentationOpen(true)}
                    >
                      <Presentation className="h-4 w-4 shrink-0" aria-hidden />
                      Presentation
                    </Button>
                    {!isShareViewer && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full"
                        onClick={() => void handleCopyShareLink()}
                      >
                        <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                        {shareLinkFeedback === 'copied' ? 'Link copied' : 'Copy view-only link'}
                      </Button>
                    )}
                  </div>
                </div>
                <PresentationModeOverlay
                  open={presentationOpen}
                  onOpenChange={setPresentationOpen}
                  screens={presentationScreens}
                  fileName={fileName}
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <ScreenGrid
                    screens={orderedScreens}
                    activePage={activePage}
                    figmaPages={pages}
                    onFigmaPageChange={setActivePage}
                    fileName={fileName}
                    screenCount={screens.length}
                    shareViewer={isShareViewer}
                    layoutReadOnly={isShareViewer}
                    onPersistScreenOrder={isShareViewer ? undefined : persistScreenOrder}
                  />
                </div>
              </div>
            )}
            {appSection === 'account' && <AccountPage fileName={fileName} fileKey={fileKey} />}
            {appSection === 'analytics' && <AnalyticsPage />}
          </div>
        </div>
      </AppShell>
    </>
  );
}

export default function App() {
  const {
    load,
    loading,
    error,
    screens,
    fileName,
    fileKey,
    progress,
    reset,
    loadSessionId,
  } = useFigmaFile();

  const shareParams = useMemo(() => readShareParamsFromLocation(), []);
  const isShareViewer = Boolean(shareParams);
  const setupFileUrl =
    isShareViewer && shareParams ? buildMinimalFigmaDesignUrl(shareParams.fileKey) : undefined;

  useEffect(() => {
    if (!shareParams || screens.length > 0 || loading) return;
    const token = localStorage.getItem(TOKEN_KEY)?.trim();
    if (!token) return;
    void load({
      token,
      fileKey: shareParams.fileKey,
      rawUrl: buildMinimalFigmaDesignUrl(shareParams.fileKey),
    });
  }, [shareParams, screens.length, loading, load]);

  const shareBootstrapOrder =
    shareParams && fileKey === shareParams.fileKey ? shareParams.order : null;

  if (screens.length > 0) {
    return (
      <FigviewApp
        key={`${fileKey}:${loadSessionId}`}
        screens={screens}
        fileName={fileName}
        fileKey={fileKey}
        loading={loading}
        progress={progress}
        error={error}
        load={load}
        reset={reset}
        shareBootstrapOrder={shareBootstrapOrder}
        isShareViewer={isShareViewer}
      />
    );
  }

  return (
    <>
      {loading && <Loader message={progress || 'Loading…'} />}
      <Setup
        onLoad={load}
        loading={loading}
        error={error}
        progress={progress}
        fileName={fileName}
        initialFileUrl={setupFileUrl}
      />
    </>
  );
}
