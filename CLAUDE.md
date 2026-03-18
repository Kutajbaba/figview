# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Vite, tries 5173+ until a free port is found)
npm run build    # tsc type-check + Vite production build
npm run lint     # ESLint
npm run preview  # serve the production build locally
```

No test framework is configured.

## Architecture

Single-page React app with two views — **Setup** and **Grid** — controlled by a `view` state string in `App.tsx`. No router.

### Data flow

1. `Setup` collects a Figma Personal Access Token (persisted to `localStorage`) and a file URL.
2. `parseFigmaUrl` (`src/lib/figma.ts`) extracts the `fileKey` from any Figma URL format (`/file/`, `/design/`, `/proto/`).
3. `useFigmaFile` hook calls the Figma REST API: `GET /v1/files/{fileKey}?depth=2` to get all pages and their top-level `FRAME`/`COMPONENT` nodes, then `GET /v1/images/{fileKey}` in batches of 50 to fetch PNG thumbnails.
4. `ScreenGrid` renders the results with page-tab filtering and name search. Each `ScreenCard` opens a prototype jump URL on click.

### State and view transitions

- `App.tsx` uses `effectiveView` to guard the grid: if `load()` throws or returns no screens, it stays on `setup` even though `setView('grid')` was called.
- The Figma token is persisted to `localStorage` under the key `figview:token` (see `Setup.tsx:TOKEN_KEY`).
- `FigmaConfig.protoFileKey` exists in `types.ts` but is not currently populated or used anywhere.

### Figma prototype URL format

```
https://www.figma.com/proto/{fileKey}/{slug}?node-id={nodeId}&scaling=contain&hide-ui=1
```

Node IDs from the API use `:` (e.g. `1:23`) — these must be replaced with `-` for prototype URLs.

### Styling

All styles are in `src/index.css` (no CSS modules, no Tailwind). Design tokens are CSS custom properties on `:root`. Fonts are IBM Plex Mono (body/mono) and Syne (display/headings), loaded from Google Fonts in `index.html`.

### TypeScript strictness

`tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`. The build (`tsc -b`) will fail on unused variables.
