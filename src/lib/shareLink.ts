export interface ShareLinkParams {
  fileKey: string;
  order: string[] | null;
}

function encodeOrderPayload(ids: string[]): string {
  const json = JSON.stringify(ids);
  const b64 = btoa(json);
  return encodeURIComponent(b64);
}

export function decodeOrderPayload(param: string): string[] | null {
  try {
    const b64 = decodeURIComponent(param);
    const json = atob(b64);
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((x): x is string => typeof x === 'string')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readShareParamsFromLocation(href?: string): ShareLinkParams | null {
  if (typeof window === 'undefined' && !href) return null;
  const url = href ?? window.location.href;
  let q: URLSearchParams;
  try {
    q = new URL(url).searchParams;
  } catch {
    return null;
  }
  if (q.get('view') !== 'share') return null;
  const fileKey = q.get('file')?.trim();
  if (!fileKey) return null;
  const orderRaw = q.get('order');
  const order = orderRaw ? decodeOrderPayload(orderRaw) : null;
  return { fileKey, order };
}

export function buildShareViewUrl(opts: { fileKey: string; order: string[]; baseHref?: string }): string {
  const base = opts.baseHref ?? (typeof window !== 'undefined' ? window.location.href : '');
  const u = new URL(base);
  u.search = '';
  u.hash = '';
  u.searchParams.set('view', 'share');
  u.searchParams.set('file', opts.fileKey);
  if (opts.order.length > 0) {
    u.searchParams.set('order', encodeOrderPayload(opts.order));
  }
  return u.toString();
}

export function buildMinimalFigmaDesignUrl(fileKey: string): string {
  return `https://www.figma.com/design/${fileKey}/file`;
}
