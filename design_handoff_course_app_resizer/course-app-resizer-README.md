# Handoff: Course App Resizer

## Overview

A browser-based image processing tool for golf course app teams. Users upload source images (course photos, logos) and the tool exports a full set of properly sized and named PNGs for submission to a course app portal. It handles splash screen generation (13 sizes), app icon & logo formatting (2 sizes), and a fixed-size header crop — all client-side with no server or API required.

The goal for Claude Code is to **host this as a real web application** — clean URL, proper deployment, possibly with minor improvements to polish and stability as noted below.

---

## About the Design Files

The file `Course App Resizer.html` in this bundle is a **fully functional high-fidelity prototype** — not a rough wireframe. It is a single self-contained HTML file with embedded CSS and JS that runs entirely in the browser. All features work as-is.

**Your task**: take this file and make it production-hostable. This could mean:
- Deploying it as-is (it's already a valid standalone page)
- Refactoring into a proper project structure (e.g. React + Vite, or plain HTML/CSS/JS split into files) if the team has a preferred stack
- Adding any missing polish items listed in the "Suggested Improvements" section below

No backend is needed — all image processing is done with the Canvas API + pure JS libraries (JSZip, UPNG.js, pako) loaded from CDN.

---

## Fidelity

**High-fidelity.** The prototype is the finished UI. Colors, typography, layout, spacing, interactions — all final. Recreate exactly if refactoring, or deploy as-is.

---

## Feature Breakdown by Tab

### Global: Header Bar
- **Course Name field** — text input, persisted in `localStorage` (`cai_courseName`). The value is sanitized (spaces → hyphens, special chars stripped) and appended to every exported zip/file name. E.g. `PebbleBeach-app-images.zip`.
- **Three tabs**: Splash screens · App icon & logo · Header crop

---

### Tab 1 — Splash Screens

Users configure a composite image (background photo + gradient overlay + logo overlay) and export it at 13 preset sizes.

#### Inputs
| Control | Type | Notes |
|---|---|---|
| Background image | File upload | Any raster image; displayed as upload zone with thumbnail preview |
| Image fit mode | Toggle: Fill / Fit | Fill = cover (crop edges); Fit = letterbox with user-chosen padding color |
| Padding color | Color picker | Shown only when Fit mode is active |
| Logo overlay | File upload | PNG recommended; shows position/size sliders once uploaded |
| Logo size | Range slider + number input | 5–80%, % of canvas width |
| Logo horizontal position | Range slider + number input | 0–100% |
| Logo vertical position | Range slider + number input | 0–100% |
| Gradient opacity | Range slider + number input | 0–100% |
| Gradient color (from) | Color picker | Dark end of gradient |
| Gradient color (to) | Color picker | Fade end of gradient |
| Gradient direction | 5-button toggle | ↓ Top→Bot, ↑ Bot→Top, → Left→Right, ← Right→Left, ↘ Diagonal |

#### Export sizes (13 files)
| Name | Dimensions | Filename |
|---|---|---|
| HDPI | 720×1280 | HDPI.png |
| XHDPI | 1080×1920 | XHDPI.png |
| XXHDPI | 1440×2560 | XXHDPI.png |
| XXXHDPI | 2160×3840 | XXXHDPI.png |
| Tablet 1X | 768×1024 | tablet-1x.png |
| Tablet 2X | 1620×2160 | tablet-2x.png |
| 1X | 320×480 | 1x.png |
| 2X | 828×1792 | 2x.png |
| 3X | 1170×2532 | 3x.png |
| Scorecard | 780×590 | scorecard.png |
| Google Featured | 1024×500 | google-featured.png |
| Google Play Logo | 512×512 | google-play.png |
| App Row | 1150×322 | app-row.png |

XXHDPI, XXXHDPI, and Tablet 2X are flagged as "large" with a warning badge (files may exceed 4MB and require PNG quantization).

#### Auto-included in export
If **App icon & logo** (Tab 2) has a logo uploaded, `app-icon.png` (180×180) and `main-logo.png` (990×495) are automatically rendered and included in the splash zip. A status indicator in the export bar shows whether these will be included.

#### Filename editing
Each row in the table has an editable filename input. Changes persist for the session.

#### Row selection
Checkboxes allow exporting a subset. "Export selected as zip" respects the selection.

#### Live preview
A canvas preview below the table renders the currently selected size row in real time as controls change.

---

### Tab 2 — App Icon & Logo

A dedicated tab for the two icon/logo assets. These are also auto-included in the splash export when configured here.

#### Inputs
| Control | Notes |
|---|---|
| Logo image upload | PNG with transparency recommended |
| Logo size | 20–95% of frame width |
| Horizontal position | 0–100% |
| Vertical position | 0–100% |

#### Outputs
| File | Dimensions | Background |
|---|---|---|
| app-icon.png | 180×180 | White (#ffffff), no transparency |
| main-logo.png | 990×495 | Transparent |

Live previews of both canvases update in real time. The logo preview uses a checkerboard background to show transparency.

Standalone export: `{courseName}-icons.zip`

---

### Tab 3 — Header Crop

A drag-to-position crop tool outputting a fixed 600×200px PNG.

#### Controls
| Control | Notes |
|---|---|
| Image upload | Any raster image |
| Zoom | 1–300%; slider + number input |
| Image fit mode | Fill (no gaps) / Fit (allow padding) |
| Padding color | Shown in Fit mode only |

#### Interactions
- **Drag** inside the crop frame to reposition the image (both mouse and touch)
- **Fill mode**: clamps image position so frame background is never exposed
- **Fit mode**: allows image to be smaller than frame; pads with chosen color; useful for images that are already smaller than 600×200
- Reset: loading a new image auto-calculates zoom to fill (or fit) and centers

#### Export
Single PNG: `{courseName}-header-600x200.png`

---

### Templates System

A collapsible "Saved templates" card at the top of the Splash tab. Saves and loads all current settings across all tabs as named presets.

**Stored in**: `localStorage` key `cai_templates` as a JSON array.

**Each template object:**
```json
{
  "name": "dark-bg-small-logo",
  "logoSize": 20,
  "logoPosX": 50,
  "logoPosY": 20,
  "gradOpac": 55,
  "gradColor1": "#000000",
  "gradColor2": "#000000",
  "gradDir": "to bottom",
  "splashFitMode": "fill",
  "splashPadColor": "#ffffff",
  "iconLogoSize": 70,
  "iconPosX": 50,
  "iconPosY": 50,
  "cropFitMode": false,
  "cropPadColor": "#ffffff"
}
```

Loading a template applies all values instantly and re-renders all previews. Templates can be deleted individually.

---

## Interactions & Behavior

### Slider ↔ Number input sync
Every range slider has a paired `<input type="number">`. They stay in sync bidirectionally. Values are clamped on blur.

### PNG compression pipeline
All exports go through a multi-step compression strategy to stay under 4MB (portal limit):
1. Lossless PNG (UPNG.js, 0 colors = full color)
2. 256-color quantization
3. 128-color quantization
4. 64-color quantization
5. Scale down at 0.9×, 0.8×, … to 0.5× with 128 colors
6. 0.5× scale with 64 colors (last resort)

A warning note appears after export if any file was compressed.

### Export progress
A progress bar fills during batch export. Status messages update per-file during processing.

### File naming
```js
// Sanitize course name
getSafeCourseName() = courseNameInput.value.trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9\-_]/g, '')
  || 'course'
```

---

## Design Tokens

### Colors (CSS custom properties, light mode)
```css
--bg: #f5f5f3
--surface: #ffffff
--border: rgba(0,0,0,0.12)
--border-med: rgba(0,0,0,0.22)
--text: #1a1a18
--text-muted: #6b6b67
--text-hint: #9b9b96
--accent: #2563eb
--blue: #1a6fcc
--blue-bg: #e8f1fb
--warn: #a05a00
--warn-bg: #fef3e0
--success: #1a6b3c
--radius: 10px
--radius-sm: 6px
```

Dark mode overrides via `@media (prefers-color-scheme: dark)` — see the HTML file.

### Typography
- Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Base: 14px / 1.5 line-height
- Card titles: 12px, 500 weight, uppercase, 0.04em letter-spacing, `--text-muted`
- Table: 13px
- Badges/labels: 10–12px

### Spacing
- Card padding: 16px 18px
- Main container: max-width 1100px, padding 20px
- Grid gaps: 16px
- Radius: 10px (cards), 6px (controls)

---

## External Libraries (CDN)

| Library | Version | Purpose |
|---|---|---|
| JSZip | 3.10.1 | ZIP file creation |
| pako | 2.1.0 | Deflate compression (JSZip dependency) |
| UPNG.js | 2.1.0 | PNG encoding with quantization |

All loaded from CDN. For production, consider vendoring these.

---

## Suggested Improvements for Claude Code

These are polish items that would make sense to address during productionization:

1. **Proper project structure** — Split into `index.html`, `style.css`, `main.js` (or React components). The current single-file format works but is harder to maintain.
2. **Vendor the CDN libraries** — Bundle JSZip, pako, UPNG.js locally so the tool works fully offline.
3. **Drag-and-drop for upload zones** — The `<input type="file">` handles this natively, but explicit `dragover`/`drop` event handlers would give better visual feedback.
4. **Mobile layout** — The tool is primarily desktop, but the header could stack better on narrow viewports. The `@media(max-width:640px)` grid collapse is in place but the header wraps awkwardly.
5. **Keyboard navigation** — Tab/Enter flow through controls; Escape to dismiss open panels.
6. **Accessibility** — Add `aria-label` attributes to icon-only buttons and color inputs; add `role="status"` to status messages.
7. **Error states** — Currently errors are silent (e.g. corrupt image files). A try/catch around `loadImg` with a user-visible error message would help.
8. **Web Workers** — Large PNG encoding (XXXHDPI at 2160×3840) blocks the main thread for 1–3 seconds. Moving `encodePNGCompressed` to a Web Worker would keep the UI responsive during export.
9. **Template import/export** — Allow exporting templates as a JSON file and re-importing, so settings can be shared across browsers/devices.

---

## Files in This Package

| File | Description |
|---|---|
| `Course App Resizer.html` | Complete working prototype — the design reference and functional implementation |
| `README.md` | This document |

---

## Deployment Notes

The tool is entirely static — no backend, no database, no authentication. It can be hosted on:
- **GitHub Pages** (free, zero config for a static HTML file)
- **Netlify / Vercel** (drag-and-drop the folder)
- **Any static file host or CDN**

If a URL like `https://tools.yourdomain.com/course-app-resizer` is desired, a simple Nginx/Caddy config serving the folder is sufficient.

`localStorage` is used for course name and templates — this is per-browser, per-origin. If multi-user or cross-device persistence is ever needed, a lightweight backend (e.g. a Cloudflare Worker + KV) could replace localStorage calls.
