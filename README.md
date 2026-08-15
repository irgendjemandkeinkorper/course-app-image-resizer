# Course App Resizer

Course App Resizer is a browser-based, client-side tool for preparing course-app imagery. It creates splash-screen PNGs, an opaque app icon, a transparent main logo, and a 600×200 header crop. Source images stay in the browser; the app has no application server.

## Quick start

No build step is required. Serve this directory with any static HTTP server, then open the local URL:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/> and upload images in the Splash screens, App icon & logo, or Header crop tabs. Opening `index.html` directly also works for the local image workflows, although browser security rules can limit some network-backed features.

## Export behavior

- Splash exports produce the configured set of PNG sizes and include the app icon and main logo when available.
- App icons are exported as opaque RGB PNGs; the main logo retains transparency.
- Large PNGs are compressed to stay below the portal's 4 MB limit. The app may quantize colors or reduce dimensions and reports that degradation in the export status.
- Browser-local history uses IndexedDB and is not uploaded to this project.
- The Rejection library reads public GitHub Issues and requires network access.

The current release loads JSZip, pako, and UPNG.js from pinned CDN URLs, so exports require network access unless those dependencies are later vendored. Google Fonts and the Rejection library are also network-backed.

## Manual smoke test

1. Open the app and switch through all five tabs.
2. Upload a valid image by picker and by drag-and-drop; try a non-image file and confirm it is rejected.
3. Configure a splash export, app icon, and crop, then confirm the ZIP/PNG downloads have the expected names and dimensions.
4. Check that an app icon has no transparency while the main logo can retain transparency.
5. Reload and confirm templates/history behave as expected.
6. Open the Rejection library with network available and verify rate-limit/offline messaging if the request fails.

## Project map

- `index.html` — the live single-file application.
- `greensward-design-system/` — design-token source and style guide.
- `design_handoff_course_app_resizer/` — read-only handoff reference.
- `vault/` — durable architecture, decision, and gotcha notes.
- `DESIGN-SYSTEM-PROMPT.md` and `WP-THEME-PROMPT.md` — reference-only prompt-engineering notes, not runtime documentation.

Contributor instructions are in [CONTRIBUTING.md](CONTRIBUTING.md), and the project is released under the [MIT License](LICENSE).
