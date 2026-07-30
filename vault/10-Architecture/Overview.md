---
type: architecture
updated: 2026-07-21
---

# Architecture: Course App Resizer — System Overview

> **TL;DR:** Single-file browser tool. Resizes + renames golf-course app images entirely client-side via the Canvas API. Only external touch is three CDN libraries on first load.

## The shape

```mermaid
flowchart LR
  CDN["CDN scripts<br/>JSZip · pako · UPNG"]:::external
  subgraph B["Browser — all processing client-side"]
    UI["index.html<br/>Splash · Icon · Crop"]:::client
    CV["Canvas API<br/>resize · quantize · 4MB compress"]:::server
    LS[("localStorage<br/>name · templates")]:::data
    Z["ZIP of PNGs<br/>download"]:::artifact
  end
  CDN -.->|scripts · first load| UI
  UI --> CV --> Z
  UI <-->|save| LS
  classDef client fill:#16324f,stroke:#4a9eff,color:#dbeafe;
  classDef server fill:#16371f,stroke:#4ade80,color:#dcfce7;
  classDef data fill:#3a2f14,stroke:#fbbf24,color:#fef3c7;
  classDef external fill:#3a1630,stroke:#f472b6,color:#fce7f3;
  classDef artifact fill:#2a2440,stroke:#a78bfa,color:#ede9fe;
  classDef planned fill:#1a1f2b,stroke:#64748b,color:#94a3b8,stroke-dasharray:4 3;
```

## Scope & surface
- **Trust boundary:** the browser tab. Images never leave it; no backend, no upload.
- Only egress is fetching **JSZip / pako / UPNG.js** from a CDN on first load (needs network once).
- Persistence is `localStorage` (`cai_courseName`, `cai_templates`) — per-browser, per-origin.

## Invariants
- Single self-contained `index.html`; the `design_handoff/` copy is byte-identical reference — edit the root file only.
- Exported filenames always run through `getSafeCourseName()`; keep the 4MB compression pipeline in the export path.

## Where things live
See `CLAUDE.md` (L0 map) — logic is indexed by function name inside the one `<script>` block.

## Related
- [[00-Index/Home]]
