# CSS style changes for MarketingHero component
_Exported on 03/04/2026 at 19:52:35 GMT+1 from Cursor (3.0.9)_

---

**User**

Apply these CSS style changes to the codebase. These changes were made in a browser preview and need to be persisted to the source files:


--- Change 1 ---
Element: <MarketingHero fileName={null}>
[CSS_CHANGE]: {
  "property": "font-family",
  "oldValue": "\"IBM Plex Mono\", ui-monospace, monospace",
  "newValue": "\"SF Compact Display\", sans-serif",
  "changeType": "style",
  "selector": "<MarketingHero> h1.font-sfCompactDisplay",
  "elementId": null,
  "elementClasses": "font-sfCompactDisplay flex w-fit text-balance text-4xl font-bold tracking-tight text-stone-900 sm:text-[64px] sm:leading-[1.1]",
  "elementTagName": "h1",
  "elementAttributes": [],
  "reactComponent": {
    "name": "MarketingHero",
    "props": {}
  }
}

CRITICAL - Element Identification:
- Use the "selector" field to find the target element (contains CSS selector like "#id", ".class", or tag)
- "elementPath" contains the DOM path (e.g., "html > body > div > ...") - use to understand element hierarchy
- "elementHTML" shows the element's HTML structure for verification
- "elementClasses" lists all CSS classes on the element - search for these in stylesheets
- If "elementReactComponent" is provided, the component name (e.g., "Button", "Card") indicates where to look

CRITICAL - Where to Make Changes:
1. First check if the element uses utility classes (Tailwind, Bootstrap): modify the className/class attribute in JSX/TSX
2. For CSS Modules (*.module.css): find the imported module and update the corresponding class
3. For styled-components/emotion: find the styled() or css`` definition in the component file
4. For global CSS/SCSS: locate the stylesheet imported by the component or in global styles
5. For inline styles: update the style prop directly in the JSX/TSX file

CRITICAL - Making the Actual Change:
- "property" is the CSS property name (e.g., "color", "padding", "font-size")
- "oldValue" is the current value - use this to locate the exact line to change
- "newValue" is what it should be changed to
- Preserve CSS units and format (e.g., if oldValue was "16px", keep pixel units unless converting to rem/em)

For CSS Style Changes:
1. Search for the element using "selector" or "elementClasses" to find relevant stylesheets
2. Find the exact CSS rule containing "property: oldValue"
3. Replace "oldValue" with "newValue"
4. If no existing rule exists, add a new declaration to the appropriate CSS file or inline style
5. For Tailwind: convert the CSS property/value to the appropriate utility class (e.g., "padding: 16px" → "p-4")
6. Ensure specificity is maintained - don't accidentally override other rules

---

**Cursor**

Locating `MarketingHero` and how `font-sfCompactDisplay` is defined so we can persist the font change.



Updating `fontFamily.sfCompactDisplay` in `tailwind.config.js` to `"SF Compact Display", sans-serif`. The h1 already uses `font-sfCompactDisplay`.



Here’s what was updated.

**Change:** `font-sfCompactDisplay` in Tailwind now resolves to `"SF Compact Display", sans-serif` instead of the previous system-ui stack.

The hero heading in `MarketingHero.tsx` already uses `font-sfCompactDisplay`, so no JSX change was required—only the theme entry in `tailwind.config.js`:

```55:55:tailwind.config.js
        sfCompactDisplay: ['"SF Compact Display"', 'sans-serif'],
```

**Note:** SF Compact Display is an Apple system UI font. It will show on macOS/iOS where that face is installed; elsewhere the browser will fall back to `sans-serif`. If you need the same look everywhere, you’d add a licensed webfont or a close substitute and wire it in `@font-face` / `index.html`.

`npm run build` completed successfully.

