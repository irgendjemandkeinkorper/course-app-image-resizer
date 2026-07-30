<!--
  CLAUDE.md — L0 baseline (the MAP + the RULES). Always loaded & prompt-cached.
  Keep it SMALL, STABLE (edit between tasks, not mid-task), DURABLE.
  Transient "for this session" understanding goes in the vault (L1), not here.
-->

# Course App Resizer

Browser-based, client-side image tool for golf-course app teams: upload source photos/logos and export a full set of correctly sized+named PNGs (13 splash sizes, app icon + main logo, a 600×200 header crop) for a course-app portal. No backend of our own — all image processing is Canvas API + pure JS; local history persists via IndexedDB, and the rejection-reason library reads/writes through the public GitHub Issues API instead of a database.

**This repo has multiple automated contributors working in parallel** (other Claude sessions, plus "Palette"/"Bolt"/"Jules" tool branches merged via PR) — `git fetch && git log master..origin/master` before starting non-trivial work; a stale local base led to a 27-hunk whole-file conflict once already. Prefer small, frequently-synced commits over long-lived local branches on this repo.

## Architecture map
<!-- Read THIS instead of grepping. index.html is one self-contained file:
     <head> = Google Fonts links + embedded CSS (design tokens, layout), then one <script> block. -->

- **Entry point:** `index.html` — single self-contained file. Open it directly in a browser (`file://`) or serve statically; no build step. CDN scripts (JSZip 3.10.1, pako 2.1.0, UPNG.js 2.1.0) need network on first load — as does Google Fonts (Fraunces/Inter), the Rejection library tab (`api.github.com`), and, once you click submit there, `github.com`.
- **Design system:** "Greensward" — semantic CSS custom properties (`--bg`, `--surface`, `--accent`, `--danger`, `--radius-lg`, `--shadow-sm`, `--duration-fast`, etc.), source of truth in `greensward-design-system/tokens.css` and documented in `greensward-design-system/styleguide.html` / `README.md`. `index.html`'s `:root` block is these tokens **mapped onto the app's existing variable names** — when adding UI, reuse an existing token/class rather than inventing a new color or one-off px value.
- **Inside `index.html`:** One `<script>` block holds all logic, across 5 tabs:
  - **Theme** — Greensward ships OS-driven dark mode only (`@media(prefers-color-scheme:dark){:root{...}}`); we layered a manual override on top: `applyTheme` sets/clears `document.documentElement.dataset.theme` (`'light'|'dark'`, absent = follow OS). CSS: base `:root` = light, `@media(prefers-color-scheme:dark){:root:not([data-theme="light"])}` = OS-driven dark, `:root[data-theme="dark"]` = manual override (wins on specificity regardless of OS). Toggle button `#themeToggleBtn` cycles System → Light → Dark, persisted in `localStorage['cai_theme']`.
  - **Splash tab** — `drawSplash` (caller sets `canvas.width`/`height` — it no longer does) / `splashRender` (renders the live preview at `devicePixelRatio` for sharpness) / `buildTable` / `runSplashExport` (13-size batch export, auto-includes app-icon + main-logo if configured; app-icon goes through `encodeOpaquePNG`, not `encodePNGCompressed`). `checkBgResolution` warns (`#bgLowResNote`) when the uploaded background is smaller than the largest configured `SIZES` entry. `drawSafeZoneGuide` draws a dashed guide-only overlay on the live preview canvas when `#safeZoneToggle` is on (`localStorage['cai_safeZone']`) — never applied to the offscreen canvases used for actual export.
  - **Icon & logo tab** — `drawIconCanvas` / `drawIconPreviews` / `loadIconLogoImg` (180×180 app-icon, 990×495 main-logo). App-icon export is `encodeOpaquePNG` (hand-rolled RGB-only PNG encoder, no alpha channel — app stores reject icons with one, even fully-opaque); main-logo stays `encodePNGCompressed` (keeps transparency).
  - **Header crop tab** — `buildCropFrame` / `drawCrop` / `clampCropOffset` / `loadCropImg` (drag-to-position, fixed 600×200). `pushCropUndo` / `undoCrop` keep a capped linear stack of `{cropOffX,cropOffY,cropZoom}` snapshots, checkpointed on drag-start, zoom-change-start, and fit-mode switches; `#cropUndoBtn` and Ctrl/Cmd+Z (while the crop tab is active) pop it.
  - **History tab** — local batch save/reload. `saveHistoryEntry` auto-runs at the end of every export handler (splash/icons/crop), snapshotting settings + source images (as data URLs) into IndexedDB (`cai_history_db`, store `batches`, capped at 20). `loadHistoryEntry` restores images + settings from a saved entry or an imported JSON file. `renderHistoryList` (fetch) → `renderHistoryListFiltered` (text filter over `_historyEntries`, `#historyFilter`) draws the card list; `updateHistoryStorageMsg` shows total size + `navigator.storage.estimate()`; checking two cards' `.history-select` boxes enables `#historyCompareBtn` → `renderHistoryCompare` (settings diff + side-by-side image thumbnails in `#historyCompare`).
  - **Rejection library tab** — the `#libSubmitBtn` handler builds a pre-filled `github.com/.../issues/new` link (label `rejection-reason`, no token — the user submits it themselves) from the intake form, including a `### Category` section (presets via `#libCategoryList` datalist); it also pushes a local-only record (never written back to GitHub) to `getLibDrafts`/`saveLibDrafts` (`localStorage['cai_lib_drafts']`), rendered by `renderLibDrafts` under "My submissions" so a filed issue URL/outcome can be tracked later. `loadRejectionLibrary` / `renderLibraryList` / `parseLibraryIssueBody` fetch and render matching issues from the public GitHub REST API, filterable by text and by the same category taxonomy (`#libCategoryFilter`). `renderLibSuggestions` (debounced on `#libReason` input) scores already-fetched issues by token (Jaccard) overlap and surfaces likely-duplicate past entries before someone re-logs the same rejection. Repo/label constants: `REPO_OWNER`, `REPO_NAME`, `REJECTION_LABEL`.
  - **Course name validation** — `requireCourseName(statusId)` gates all 3 export handlers: returns the sanitized name or `null` (and focuses/flags `#courseNameInput`, shows an error in the given status element) if empty. Exports are named after the course so files don't get lost in Downloads — don't reintroduce the old silent `|| 'course'` fallback.
  - **PNG compression** — `encodePNGCompressed` / `enc` / `_enc` / `_scale`: lossless → 256/128/64-color quantize → downscale, to stay under the portal's 4MB limit. `encodeOpaquePNG` (+ `_crc32`/`_pngChunk`) is the separate alpha-free path used only for the app-icon.
  - **Templates** — `getTemplates` / `saveTemplates` / `applySettings` / `getCurrentSettings`: named presets across all tabs (history reuses `getCurrentSettings`/`applySettings`, extended with crop zoom/offset).
  - **Zip / naming** — `downloadZip`, `getSafeCourseName` (sanitizes course name into every filename).
- **Persistence:** `localStorage` keys `cai_courseName`, `cai_templates` (JSON array), `cai_theme`, `cai_safeZone`, `cai_lib_drafts` (JSON array) — per-browser, per-origin. Batch history additionally uses IndexedDB (`cai_history_db`) for larger per-entry payloads (source images).
- **Where NOT to look:** `design_handoff_course_app_resizer/` is handoff reference only — `Course App Resizer.html` is byte-identical to an older version of `index.html`; edit the root file, never that copy. `greensward-design-system/` is the design token *source of truth* (read it, don't re-derive values by eyeballing `index.html`) but isn't itself the app. `.jules/`, `DESIGN-SYSTEM-PROMPT.md`, `WP-THEME-PROMPT.md` are other agents' working notes — reference only. Ignore `*:Zone.Identifier` (WSL junk) and `.git/`.

## Deeper context lives in the vault
<!-- L1. Link notes; don't inline long explanations here. -->

Curated, durable knowledge lives in the Obsidian vault under `vault/` (not yet scaffolded):

- Architecture deep-dives → `vault/10-Architecture/`
- Decisions (ADRs)        → `vault/30-Decisions/`
- Known gotchas/footguns  → `vault/40-Gotchas/`

When a task touches an area, open the matching note **before** reading source.

## Conventions

- **Single-file app.** New logic goes in the existing `<style>` / `<script>` blocks of `index.html` unless a refactor to split files (`style.css` / `main.js`) is explicitly requested.
- **High-fidelity prototype = final UI.** Colors, type, spacing, interactions are done (Greensward design system). Match existing tokens/classes (`.card`, `.field-input`, `.small-btn`, etc.); don't restyle ad hoc or introduce parallel color values.
- Every range slider is paired with a `<input type="number">` kept in sync (`syncSliderNum`); preserve that pattern for new controls.
- Exported filenames always run through `getSafeCourseName()`; keep the 4MB compression pipeline in the export path.

## Bash commands

- **Search content:** `rg` over `grep` · **Find files:** `fd` over `find` · **JSON:** `jq`
- No package manager / build / test tooling — it's a static single file. To preview: open `index.html` in a browser, or `python3 -m http.server` from the repo root.

## Working agreement (token discipline)

- **Use the map above and the vault before searching.** Grep only when the map doesn't answer.
- **When I name a file or symbol, that's your pivot** — start there; don't re-scan to "confirm" it.
- **Prefer signatures over bodies** for supporting code; read a full function only when editing it. It's one large file — jump by the function names above rather than re-reading the whole thing.
- **Explore in a subagent** so this conversation's context stays lean.
- **End-of-task ritual:** if you learned something durable, propose a short vault note (or a `CLAUDE.md` edit if a structural fact changed).

## Do NOT
- Don't edit this file mid-task (breaks the prompt cache).
- Don't edit `design_handoff_course_app_resizer/Course App Resizer.html` — it's a reference copy; the live app is root `index.html`.
- Don't reformat/mass-rename or split the file into multiple files unless the task explicitly asks for it.
