/**
 * Strip emoji / pictographic characters from Figma page names for clean sidebar labels.
 * Filtering still uses the raw `pageName` from the API.
 */
export function sanitizePageNavLabel(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}+/gu, '')
    .replace(/\u200d/gi, '')
    .replace(/\ufe0f/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}
