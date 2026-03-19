/**
 * Heuristics to skip Figma library / token pages and tiny non-screen frames
 * so only real mobile or web-sized prototype frames are indexed.
 */

/** Normalize page title for name-based matching (strip emoji, collapse space). */
export function normalizePageTitleForMatch(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}+/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Skip whole canvases that are almost always component libraries, not flows.
 * Does not replace dimension checks — used as an extra guard.
 */
export function shouldSkipPrototypeIndexingPage(pageName: string): boolean {
  const n = normalizePageTitleForMatch(pageName);
  if (!n) return false;

  const patterns: RegExp[] = [
    /\bcomponents?\b/,
    /\bui[\s_-]*kit\b/,
    /\buikit\b/,
    /\bdesign[\s_-]*system\b/,
    /\bstyle[\s_-]*guide\b/,
    /\bfoundations?\b/,
    /\bds[\s_-]/, // "DS — …"
    /^ds\b/,
    /\bsymbols?\b/,
    /\blibraries?\b/,
    /\bicon(s|\s+set)?\b/,
    /\btokens?\b/,
    /\bsticker\b/,
    /\bassets?\s*only\b/,
    /\bpatterns?\s*only\b/,
  ];

  return patterns.some(re => re.test(n));
}

/**
 * True if width/height look like a phone, tablet, or desktop/web artboard — not a chip, token, or strip.
 */
export function isLikelyPrototypeScreen(width?: number, height?: number): boolean {
  if (
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return false;
  }

  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);
  const area = width * height;
  const ratio = maxSide / minSide;

  // Long strips / odd chrome — not a screen
  if (ratio > 2.75) return false;

  const isPortrait = height >= width * 1.06;
  const isLandscape = width >= height * 1.06;

  if (isPortrait) {
    // Mobile / tablet portrait (roughly ≥ phone size)
    return minSide >= 280 && maxSide >= 560 && area >= 220_000;
  }
  if (isLandscape) {
    // Desktop / tablet landscape
    return minSide >= 500 && maxSide >= 640 && area >= 380_000;
  }

  // Nearly square: only if clearly a large canvas (e.g. some tablets)
  return minSide >= 600 && area >= 500_000;
}
