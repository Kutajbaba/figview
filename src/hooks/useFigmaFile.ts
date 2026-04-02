import { useState, useCallback } from 'react';
import { fetchFile, fetchImages, buildProtoUrl } from '../lib/figma';
import {
  isLikelyPrototypeScreen,
  shouldSkipPrototypeIndexingPage,
} from '../lib/prototypeFrames';
import { recordRecentDesign } from '../lib/recentDesigns';
import type { ScreenFrame, FigmaConfig } from '../types';

function inferKind(name: string, width?: number, height?: number): 'mobile' | 'desktop' {
  if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
    // Portrait-ish frames are treated as "mobile".
    if (height >= width * 1.05) return 'mobile';
    return 'desktop';
  }

  const n = name.toLowerCase();
  if (/(iphone|ipad|android|mobile|phone|samsung|pixel|galaxy|iphone|ios)/i.test(n)) return 'mobile';
  return 'desktop';
}

interface State {
  loading: boolean;
  error: string | null;
  fileName: string;
  fileKey: string;
  screens: ScreenFrame[];
  progress: string;
  /** Increments on each successful load (screens may be non-empty). Used to gate one-shot UI like post-load modals. */
  loadSessionId: number;
}

export function useFigmaFile() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    fileName: '',
    fileKey: '',
    screens: [],
    progress: '',
    loadSessionId: 0,
  });

  const load = useCallback(async (config: FigmaConfig): Promise<boolean> => {
    setState(s => ({
      ...s,
      loading: true,
      error: null,
      progress: 'Fetching file…',
    }));

    try {
      const file = await fetchFile(config.fileKey, config.token);

      // Collect all top-level FRAME nodes across all pages
      const frames: Array<{
        id: string;
        name: string;
        pageId: string;
        pageName: string;
        width?: number;
        height?: number;
      }> = [];
      for (const page of file.document.children) {
        if (shouldSkipPrototypeIndexingPage(page.name)) {
          continue;
        }

        for (const node of page.children ?? []) {
          if (node.type !== 'FRAME' && node.type !== 'COMPONENT') continue;

          const width = node.absoluteBoundingBox?.width;
          const height = node.absoluteBoundingBox?.height;

          if (!isLikelyPrototypeScreen(width, height)) {
            continue;
          }

          frames.push({
            id: node.id,
            name: node.name,
            pageId: page.id,
            pageName: page.name,
            width,
            height,
          });
        }
      }

      if (frames.length === 0) {
        throw new Error(
          'No prototype-sized screens found. Library or component-only pages are skipped. Add top-level frames that look like phone, tablet, or desktop screens (not small UI tiles).'
        );
      }

      setState(s => ({
        ...s,
        progress: `Loading thumbnails for ${frames.length} screens…`,
      }));

      // Figma limits image requests; batch in chunks of 50
      const CHUNK = 50;
      const imageMap: Record<string, string> = {};
      for (let i = 0; i < frames.length; i += CHUNK) {
        const chunk = frames.slice(i, i + CHUNK);
        const ids = chunk.map(f => f.id);
        const result = await fetchImages(config.fileKey, ids, config.token, 1);
        Object.assign(imageMap, result.images);
        setState(s => ({
          ...s,
          progress: `Loading thumbnails… ${Math.min(i + CHUNK, frames.length)}/${frames.length}`,
        }));
      }

      const screens: ScreenFrame[] = frames.map(f => ({
        id: f.id,
        name: f.name,
        pageId: f.pageId,
        pageName: f.pageName,
        thumbnailUrl: imageMap[f.id] ?? undefined,
        protoUrl: buildProtoUrl(config.fileKey, f.id, file.name),
        kind: inferKind(f.name, f.width, f.height),
      }));

      const thumb = file.thumbnailUrl ?? screens[0]?.thumbnailUrl ?? null;
      recordRecentDesign({
        fileKey: config.fileKey,
        fileName: file.name,
        rawUrl: config.rawUrl,
        thumbnailUrl: thumb ?? null,
      });

      setState(s => ({
        loading: false,
        error: null,
        fileName: file.name,
        fileKey: config.fileKey,
        screens,
        progress: '',
        loadSessionId: s.loadSessionId + 1,
      }));
      return true;
    } catch (e: unknown) {
      setState(s => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        progress: '',
      }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      fileName: '',
      fileKey: '',
      screens: [],
      progress: '',
      loadSessionId: 0,
    });
  }, []);

  return { ...state, load, reset };
}
