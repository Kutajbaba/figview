import type { FigmaFileResponse, FigmaImagesResponse } from '../types';

const BASE = 'https://api.figma.com/v1';

async function req<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API ${res.status}: ${text}`);
  }
  return res.json();
}

export function fetchFile(fileKey: string, token: string): Promise<FigmaFileResponse> {
  return req<FigmaFileResponse>(`/files/${fileKey}?depth=2`, token);
}

export function fetchImages(
  fileKey: string,
  nodeIds: string[],
  token: string,
  scale = 1
): Promise<FigmaImagesResponse> {
  const ids = nodeIds.map(encodeURIComponent).join(',');
  return req<FigmaImagesResponse>(
    `/images/${fileKey}?ids=${ids}&format=png&scale=${scale}`,
    token
  );
}

/** Parse a Figma URL to extract fileKey and optional nodeId */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const u = new URL(url);
    // matches /file/, /design/, /proto/
    const match = u.pathname.match(/\/(file|design|proto)\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    const fileKey = match[2];
    const nodeId = u.searchParams.get('node-id') ?? undefined;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

/** Build a prototype jump URL for a given node */
export function buildProtoUrl(fileKey: string, nodeId: string, fileName: string): string {
  const slug = fileName.toLowerCase().replace(/\s+/g, '-');
  // Figma proto URLs use dashes in node-id
  const safeNodeId = nodeId.replace(/:/g, '-');
  return `https://www.figma.com/proto/${fileKey}/${slug}?node-id=${safeNodeId}&scaling=contain&hide-ui=1`;
}
