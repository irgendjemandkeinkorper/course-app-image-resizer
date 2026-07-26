# Greensward — WordPress FSE Block Theme Prompt

> Paste this into Claude (or Claude Code) to generate the **greensward** WordPress
> block theme. Best run AFTER the design-system prompt (it can consume the generated
> `tokens.css` / `tokens.json`), but it restates the token direction so it also runs
> standalone.

---

You are a senior WordPress theme developer. Build a modern **Full Site Editing (FSE)
block theme** named **greensward** that is a faithful, native implementation of the
Greensward design system (calm, premium, editorial; abstract-golf greens + warm sand
neutrals). It must be a REUSABLE, multi-purpose template — content-agnostic and easy
to rebrand — not tied to golf specifically.

## 0. Design tokens to implement (source of truth)
[If the design-system prompt was run: use its tokens.css / tokens.json verbatim.]
Otherwise implement this palette & type direction:
- Neutrals are WARM SAND, not grey. Signature accent = deep matte fairway green.
  Secondary accent = muted sky blue, used sparingly. Hairline low-contrast borders.
- Editorial serif display + clean sans body. Generous spacing, 4px scale, soft radii,
  soft low-opacity shadows, calm subtle motion. Full light + dark. WCAG AA throughout.

## 1. Technical requirements
- WordPress 6.5+, block theme, NO page builder, NO jQuery. PHP 8.1+.
- Everything driven by `theme.json` (v3 schema) as the single source of truth — map
  every design token to a WP preset so it appears in the editor UI and in Global Styles.
- Self-host all fonts locally and register them via `theme.json` `fontFamilies`
  (fontFace with local src) — no Google Fonts CDN calls (privacy + performance).
- Zero required plugins. Core blocks + patterns + block-style-variations only; add a
  small custom block ONLY if a need can't be met by core blocks (justify it first).
- Accessible (WCAG AA), fast (minimal/zero JS, no render-blocking), and translation-ready
  (proper text-domain, .pot file).

## 2. theme.json — map the system
- settings.color.palette + .gradients + .duotone: expose the semantic palette
  (backgrounds, surface, text, muted, accent, secondary, functional). Use clear
  slugs (e.g. "accent", "surface", "text-muted"). Turn OFF custom color where it would
  let editors break contrast; keep the curated palette front-and-center.
- settings.typography: register the font families (local fontFace), define a
  fluid `fontSizes` scale (use clamp() for responsive type) with the editorial steps,
  fontWeights, letterSpacing. Enable fluid typography.
- settings.spacing: custom `spacingSizes` on the 4px scale; set contentSize (~720px
  prose) and wideSize (~1200–1280px) for the constrained/wide/full alignment system.
- settings.layout, shadows (map the soft elevation tokens to settings.shadow presets),
  border radius presets, and dimensions.
- styles: set global background/text/link colors, base typography, block-level styles
  for core blocks (button, heading, quote, table, separator, navigation, etc.) so the
  whole site inherits Greensward with no per-block fiddling. Include an "eyebrow"
  look via a block style variation.
- Provide STYLE VARIATIONS in `/styles/`: at minimum a `dark.json` (dark mode) and a
  `dusk.json` (sky-blue accent) — proving the theme re-themes via Global Styles.

## 3. Templates & template parts (in `/templates/` and `/parts/`)
Templates (HTML block markup): index, front-page, page, single, archive, search,
404, home (blog).
Template parts: header (with logo, primary nav, optional CTA button, mobile nav),
footer (columns, secondary nav, fine-print), and a reusable page-hero part.
Keep markup semantic and minimal; rely on theme.json for styling, not inline styles.

## 4. Block patterns (in `/patterns/`) — the reusable template value
Author a rich library of content-agnostic patterns, each registered with categories
and translation-ready placeholder copy/images. Include at least:
- Heroes: editorial hero (eyebrow + serif headline + supporting text + dual CTA),
  full-bleed image hero, split hero (text | image).
- Section headers (eyebrow + heading + intro), feature grids (3-up / 4-up with icons),
  alternating feature rows (image/text zig-zag), stat/figure band, logo/partner strip.
- Editorial: long-form prose layout, pull-quote, image + caption, two-column text.
- Conversion: CTA band, pricing table (3 tiers), FAQ (details/accordion via core),
  testimonial/quote grid, newsletter signup, contact section.
- Structural: header variants, footer variants, 404 content.
Name patterns generically (no golf terms) so they template to any site.

## 5. Block style variations & editor experience
- Register block style variations (e.g. Button: solid/outline/ghost; Group: "card",
  "raised card", "hairline"; Image: "framed"; Quote: "editorial") via
  `register_block_style` and/or theme.json block styles.
- Load an `editor-style.css` so the editor canvas matches the front end 1:1.
- Enqueue a tiny front-end stylesheet ONLY for what theme.json can't express
  (e.g. custom focus-ring, reduced-motion handling, dropzone/hover niceties).
  Prefer :where() for low specificity. Keep total CSS lean.

## 6. File structure & standards
Produce a complete, installable theme:
  greensward/
    style.css              (theme header metadata + version + license)
    theme.json             (v3, the token map)
    functions.php          (setup, enqueue, register patterns/styles/block styles,
                            editor styles, i18n, disable core bloat like emoji if wanted)
    templates/*.html
    parts/*.html
    patterns/*.php
    styles/dark.json, styles/dusk.json
    assets/fonts/*         (self-hosted)  assets/css/*  assets/images/*
    editor-style.css
    languages/greensward.pot
    readme.txt / README.md (install, rebrand-how-to, credits, license)
Follow WordPress coding standards, escape/sanitize appropriately, use a single
text-domain ("greensward"), and gate PHP behind function_exists/version checks.

## 7. Rebranding guide (make it a real template)
In the README, document exactly how to rebrand to a non-golf project: which
theme.json palette slugs + font families to change, how to add a style variation,
and confirm nothing golf-specific is hard-coded.

## 8. Acceptance criteria
- Installs cleanly, activates with no errors/warnings (WP 6.5+, PHP 8.1+).
- Global Styles UI reflects the full palette, type scale, and spacing.
- Front-end and editor render identically; light/dark/Dusk variations all work.
- Passes basic a11y checks (contrast, focus, landmarks, alt text in patterns).
- Lighthouse: no render-blocking fonts, minimal JS, strong performance/SEO scores.

## 9. Process
First output: (a) the proposed `theme.json` skeleton with the palette + typography +
spacing presets filled in, and (b) the template/part/pattern inventory list — and
pause for my confirmation BEFORE generating all template HTML, patterns, and PHP.
