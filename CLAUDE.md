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

Single-page React app (no router). `App.tsx` is the top-level component; when screens are loaded it renders `FigviewApp`, otherwise it shows `Setup`.

### Data flow

1. `Setup` collects a Figma Personal Access Token (persisted to `localStorage`) and a file URL.
2. `parseFigmaUrl` (`src/lib/figma.ts`) extracts the `fileKey` from any Figma URL format (`/file/`, `/design/`, `/proto/`).
3. `useFigmaFile` hook calls the Figma REST API: `GET /v1/files/{fileKey}?depth=2` to get all pages and their top-level `FRAME`/`COMPONENT` nodes, then `GET /v1/images/{fileKey}` in batches of 50 to fetch PNG thumbnails.
4. `ScreenGrid` renders the results with page-tab filtering and name search. Each `ScreenCard` opens a prototype jump URL on click.

### Shell sections and navigation

`FigviewApp` wraps everything in `AppShell`, which provides a sidebar with four sections (`AppSection` type): `dashboard`, `designs`, `account`, `analytics`. Section state lives in `App.tsx`; there is no URL-based routing.

The **designs** section has two phases (`DesignsPhase`): `browse` (shows `DesignsBrowsePage` with a file picker and recent designs) and `grid` (shows `ScreenGrid` for the currently loaded file). After a file loads, `PostLoadModal` appears once per browser tab session asking the user which phase to enter; the choice is stored in `sessionStorage`.

### State and storage

| Key | Storage | Purpose |
|---|---|---|
| `figview:token` | `localStorage` | Figma PAT |
| `figview:screen-order:{fileKey}` | `localStorage` | Persisted drag-reorder for each file |
| `figview:recent-designs` | `localStorage` | Array of `RecentDesignRecord` (max 12, newest first) |
| `figview:post-load-seen` | `sessionStorage` | Whether the post-load modal has shown this tab |
| `figview:post-load-pref` | `sessionStorage` | Last section choice (`designs` \| `explore`) |

All storage keys and helpers live in `src/lib/figviewStorageKeys.ts`; screen-order helpers are in `src/lib/screenLayout.ts`. Mutations to recent-designs fire a `figview:recent-changed` `CustomEvent` on `window` so listeners can refresh without polling.

### Share links

`buildShareViewUrl` (`src/lib/shareLink.ts`) encodes `?view=share&file={fileKey}&order={base64}` into the current page URL. `readShareParamsFromLocation` detects this on load; if present, `isShareViewer` is `true`, which hides editing controls and locks the section to `designs/grid`.

- `FigmaConfig.protoFileKey` exists in `types.ts` but is not currently populated or used anywhere.

### Figma prototype URL format

```
https://www.figma.com/proto/{fileKey}/{slug}?node-id={nodeId}&scaling=contain&hide-ui=1
```

Node IDs from the API use `:` (e.g. `1:23`) — these must be replaced with `-` for prototype URLs.

### Screen filtering heuristics

`useFigmaFile` skips pages whose names match library/token patterns (see `shouldSkipPrototypeIndexingPage` in `src/lib/prototypeFrames.ts`) and filters individual frames via `isLikelyPrototypeScreen`, which rejects frames that are too small, too large in aspect ratio (> 2.75:1), or don't meet minimum area thresholds for portrait/landscape/square orientations.

### UI primitives

`src/components/ui/` contains shadcn/ui primitives (Radix UI + class-variance-authority). Import them via the `@/` alias (maps to `src/`): `import { Button } from '@/components/ui/button'`. Do not add new shadcn components without also adding their Radix peer dependency.

### Styling

All styles are in `src/index.css` (no CSS modules, no Tailwind). Design tokens are CSS custom properties on `:root`. Fonts are IBM Plex Mono (body/mono) and Syne (display/headings), loaded from Google Fonts in `index.html`.

### TypeScript strictness

`tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters`. The build (`tsc -b`) will fail on unused variables.
