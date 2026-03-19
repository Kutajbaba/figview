import { useState, useCallback } from 'react';
import { fetchFile, fetchImages, buildProtoUrl } from '../lib/figma';
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
  screens: ScreenFrame[];
  progress: string;
}

export function useFigmaFile() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    fileName: '',
    screens: [],
    progress: '',
  });

  const load = useCallback(async (config: FigmaConfig) => {
    setState(s => ({ ...s, loading: true, error: null, screens: [], progress: 'Fetching file…' }));

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
        for (const node of page.children ?? []) {
          if (node.type === 'FRAME' || node.type === 'COMPONENT') {
            frames.push({
              id: node.id,
              name: node.name,
              pageId: page.id,
              pageName: page.name,
              width: node.absoluteBoundingBox?.width,
              height: node.absoluteBoundingBox?.height,
            });
          }
        }
      }

      if (frames.length === 0) {
        throw new Error('No frames found in this file. Make sure the file has top-level frames.');
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

      setState({
        loading: false,
        error: null,
        fileName: file.name,
        screens,
        progress: '',
      });
    } catch (e: unknown) {
      setState({
        loading: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        fileName: '',
        screens: [],
        progress: '',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      fileName: '',
      screens: [],
      progress: '',
    });
  }, []);

  return { ...state, load, reset };
}
