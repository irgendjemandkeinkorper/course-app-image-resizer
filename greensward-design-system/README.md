# Greensward — Design System

A calm, premium, **editorial** design system that captures the *abstract feeling* of
golf — early-morning light on open turf, precision, restraint, wide unhurried space —
with **none** of the literal iconography (no balls, flags, clubs, or "19th hole" puns).

It is deliberately built as a **reusable template**: semantic tokens sit over raw
primitives, so re-theming for any brand — golf or not — is a one-file swap.

```
greensward-design-system/
├── tokens.css       # Primitives + semantic tokens (CSS custom properties)
├── tokens.json      # Same tokens, tool-agnostic (Style-Dictionary friendly)
├── styleguide.html  # Living proof: renders the whole system, light/dark + Dusk
└── README.md        # This file
```

Open **`styleguide.html`** in any browser. Use the header toggles to switch
**Fairway ↔ Dusk** accent and **Light ↔ Dark** mode.

---

## Principles

1. **Quiet by default.** Warm sand neutrals and hairline structure carry the layout;
   one confident fairway green is reserved for the actions that matter. Nothing shouts.
2. **Space is a material.** A generous 4px spacing scale and wide measures do the work
   that borders and boxes do in noisier systems.
3. **Editorial voice.** A serif display (Fraunces) over a humanist sans (Inter) gives
   pages a magazine-grade, premium feel without ornament.
4. **Natural light.** Shadows are soft and low-opacity; radii are restrained. Motion is
   short and eased — never bouncy.
5. **Accessible, always.** Every text/background pairing meets WCAG 2.1 AA. Dark mode is
   first-class. Focus is always visible. `prefers-reduced-motion` is honored.
6. **Semantic over raw.** Components reference only semantic tokens, never primitives.

---

## Token architecture

Two tiers — this is the reusability engine:

```
PRIMITIVES              SEMANTIC ROLES              COMPONENTS
--fairway-500  ──────▶  --color-accent      ──────▶ .btn-primary { background: var(--color-accent) }
--sand-50      ──────▶  --color-bg
--stone-…      ──────▶  --color-text
```

- **Primitives** (`--fairway-*`, `--sand-*`, `--stone-*`, `--sky-*`) are raw hue scales.
  **Never reference them directly in components.**
- **Semantic tokens** (`--color-bg`, `--color-accent`, `--color-text-muted`, …) are the
  only API components use. Light values live in `:root`; dark values in
  `[data-theme="dark"]` and under `@media (prefers-color-scheme: dark)`.

### Palette at a glance

| Role | Primitive family | Notes |
|---|---|---|
| Signature accent | **Fairway** (green) | Deep, matte. CTAs, active states, key marks. Used sparingly. |
| Primary neutral | **Sand** (warm) | Backgrounds/surfaces. Warm, not clinical grey — this reads "natural". |
| Text / structure | **Stone** (charcoal) | Body text and dark surfaces. |
| Secondary accent | **Sky** (muted blue) | The horizon note. Sparing use; becomes primary in the Dusk theme. |

### Verified contrast (WCAG 2.1 AA)

| Pairing | Light | Dark |
|---|---|---|
| text on bg | 13.98:1 | 14.62:1 |
| text-muted on bg | 6.67:1 | 8.56:1 |
| text-subtle on bg | 4.84:1 | 5.34:1 |
| accent-contrast on accent | 6.26:1 | 7.38:1 |
| accent (link) on bg | 5.70:1 | 6.96:1 |

All ≥ 4.5:1 (body) / ≥ 3:1 (large text & UI).

---

## Theming

### Light / Dark
Set `data-theme` on `<html>`: `light`, `dark`, or omit it to follow the OS.

```html
<html data-theme="dark">
```

### Dusk (alternate accent)
`data-accent="dusk"` remaps the accent role from Fairway green to Sky blue — proving the
system re-themes by swapping semantics, not rewriting components. Combine with dark:

```html
<html data-theme="dark" data-accent="dusk">
```

---

## How to rebrand (for a non-golf project)

Because components only touch semantic tokens, rebranding is a **one-file edit**:

1. Open `tokens.css`. In the **PRIMITIVES** block, replace the `--fairway-*` scale
   (and, if desired, `--sand-*` / `--sky-*`) with your brand scales.
2. That's it — every component, in light and dark, re-skins automatically. You do **not**
   touch the semantic block or any component CSS.
3. To add a whole alternate theme, copy the `[data-accent="dusk"]` block, rename it
   (e.g. `[data-accent="brand-x"]`), and remap the accent semantics.
4. Mirror the change in `tokens.json` if you consume tokens on other platforms.

> Tip: keep 10 steps (50→900) per primitive scale and re-check contrast for any pairing
> you change. A quick relative-luminance check keeps you honest about AA.

---

## Usage

```html
<link rel="stylesheet" href="tokens.css">
<!-- then your component styles, referencing semantic tokens only -->
<style>
  .btn-primary { background: var(--color-accent); color: var(--color-accent-contrast); }
</style>
```

Component patterns (buttons, forms, tabs, badges, alerts, tables, dialog, and editorial
blocks) are demonstrated in `styleguide.html`; lift the CSS from its `<style>` block or
port it into your framework of choice.

### Token naming conventions
- Colors: `--color-<role>[-<variant>]` (e.g. `--color-text-muted`, `--color-accent-hover`).
- Scale tokens: `--space-N`, `--font-size-<step>`, `--radius-<size>`, `--shadow-<size>`.
- Never invent a component-specific color; add a semantic role if a genuine new role exists.

---

## Fonts

- **Display:** Fraunces (serif) — self-host the variable font for production.
- **Body/UI:** Inter (sans) — self-host, or the `system-ui` fallback keeps it usable.
- **Mono:** IBM Plex Mono.

The styleguide references these families with robust fallbacks, so it renders acceptably
even before you install the webfonts. For production (and the WordPress theme), self-host
the font files — no CDN calls.

---

## Relationship to the WordPress theme

These tokens are the source of truth for the **greensward** WordPress FSE block theme
(see `WP-THEME-PROMPT.md` at the repo root). There, the semantic tokens map to
`theme.json` presets, and the Dusk/dark themes become Global Style variations.
