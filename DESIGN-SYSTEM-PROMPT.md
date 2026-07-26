# Greensward — Design System Prompt

> Paste this into Claude (or Claude Code) to generate the **Greensward** design system.
> "Greensward" is a working name — an old, editorial word for open turf. It evokes
> fairways and calm without a single flag or club. Swap it for your own brand name.

---

You are a senior product designer and design-systems engineer. Build a complete,
production-ready design system called **Greensward**. Deliver it as (a) a portable
token layer, (b) a documented component library, and (c) a living style-guide page.

## 1. Creative north star
Greensward should capture the ABSTRACT FEELING of golf — never the literal iconography.

DO evoke: early-morning calm on a manicured landscape; wide, unhurried open space;
precision and restraint; quiet premium confidence; the horizon line where fairway
meets sky; natural light and shadow on turf and sand.

DO NOT use: golf balls, flags, clubs, tees, holes, scorecards, caddies, or any
sports-equipment iconography. No "19th hole" puns. If a stranger saw it, they should
feel *calm, expensive, and natural* — and only sense "golf" subconsciously.

Personality: calm · premium · editorial. Think the intersection of a fine hospitality
brand, a modern editorial magazine, and a precision instrument. Generous whitespace,
confident restraint, no visual noise.

## 2. Reusability requirement (critical)
This is also a REUSABLE TEMPLATE for future sites beyond golf. Therefore:
- All tokens must be SEMANTIC (e.g. --color-surface, --color-accent), with a separate
  PRIMITIVE layer beneath (raw hues). Rebranding = swap the primitive palette only.
- Ship at least one alternate accent theme to prove the system re-themes cleanly.
- Nothing golf-specific may leak into token names or component names.

## 3. Color system — "abstract golf greens + sand"
Build a two-tier palette: primitives (raw scales) → semantic tokens (roles).
Provide full light AND dark modes. Every text/background pairing MUST meet WCAG AA
(4.5:1 body, 3:1 large text & UI). Include the contrast ratio next to each pairing.

Primitive scales to generate (each 50→900, plus a true-black and true-white anchor):
- **Fairway** — deep, slightly desaturated forest/fairway greens. This is the signature.
- **Sand** — warm bunker/linen neutrals (this is the primary NEUTRAL, not grey).
- **Stone** — cool charcoal-to-slate greys for text and structure.
- **Sky** — a restrained muted sky/horizon blue, used sparingly as a secondary accent.
- A small functional set: success, warning, danger, info (tuned to sit in this palette,
  not stock Bootstrap colors).

Semantic tokens (define for light + dark):
--color-bg, --color-bg-subtle, --color-surface, --color-surface-raised,
--color-border-hairline, --color-border, --color-text, --color-text-muted,
--color-text-subtle, --color-accent, --color-accent-hover, --color-accent-contrast,
--color-accent-subtle-bg, --color-secondary (sky), --color-focus-ring, plus the
functional roles (success/warning/danger/info each with -bg and -fg variants).

Aesthetic guidance:
- Neutrals should be WARM (sand-based), not clinical grey — this is what reads "natural."
- Green is the anchor accent; use it with restraint (CTAs, active states, key marks),
  never wallpaper. Large green fields should be deep and matte, never lime or glossy.
- Borders are HAIRLINE (0.5px–1px) and low-contrast. Prefer separation by whitespace
  and subtle surface elevation over heavy lines.
- Provide one alternate accent theme ("Dusk" — swap Fairway-green accent for the Sky
  blue as primary) to prove re-theming.

## 4. Typography — editorial pairing
- Display/headings: a refined serif OR high-contrast humanist sans that reads editorial
  and premium (recommend and justify a specific pairing; use only open-source/self-
  hostable fonts, e.g. a serif like Fraunces/Newsreader + a grotesk like Inter/Geist/
  IBM Plex Sans). Give exact families + fallbacks.
- Body/UI: a clean, highly legible sans at comfortable reading size.
- Define a modular type scale (recommend a ratio, ~1.2 minor-third for UI density,
  with larger editorial display steps): step tokens --font-size-2xs … --font-size-6xl,
  with matched line-heights and letter-spacing (tighter tracking on large display,
  slightly looser on all-caps eyebrows/labels).
- Define weights actually used (e.g. 400/500/600/700) and a text-transform "eyebrow"
  style (uppercase, small, tracked) that recurs across the system.

## 5. Spacing, layout & shape
- 4px base spacing scale as tokens --space-0 … --space-32 (0,2,4,8,12,16,20,24,32,
  40,48,64,80,96,128). Generous by default — this is a spacious system.
- Layout tokens: content max-width (~72ch for prose, ~1200–1280px for app shells),
  a wide "editorial" width, gutter/padding tokens, and a responsive breakpoint set
  (sm/md/lg/xl/2xl) as tokens.
- Radius scale: --radius-sm/md/lg/xl/full. Lean toward soft-but-restrained (8–12px
  for cards), nothing bubbly.
- Elevation: define 3–4 shadow tokens that are SOFT and low-opacity (natural light,
  not drop-shadow harsh). Provide dark-mode shadow equivalents (usually reduced).
- Motion: duration + easing tokens (--ease-out-quiet, --duration-fast/base/slow).
  Motion is calm and subtle — short, eased, never bouncy. Respect
  prefers-reduced-motion. Define default focus-visible ring styling.

## 6. Component library
Design and specify (with all states: default/hover/active/focus-visible/disabled,
plus light+dark) at least:
- Buttons (primary, secondary, ghost, danger, icon-only) + sizes
- Form controls: text input, textarea, select, checkbox, radio, toggle, slider,
  color input, range+number paired control, file upload / dropzone
- Tabs, segmented control, badges/tags, tooltips, cards, tables, progress bar,
  status/alert notes (success/warn/info), modal/dialog, dropdown/menu
- Navigation: top bar / app header, footer, sidebar
- Editorial blocks: hero, section header w/ eyebrow, feature grid, stat/figure,
  quote/pull-quote, image with caption, CTA band, prose ("rich text") styling.
Each component: purpose, anatomy, tokens consumed, accessibility notes (roles, aria,
keyboard), and do/don't.

## 7. Accessibility & quality bar
- WCAG 2.1 AA minimum across the board; document every contrast pairing.
- Full keyboard operability; visible focus states; reduced-motion support.
- Dark mode is first-class, not an afterthought.
- Respect system font-size scaling (use rem for type, not px).

## 8. Deliverables (produce all)
1. `tokens.css` — primitives + semantic tokens as CSS custom properties, with
   `:root` (light), `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)`,
   plus the alternate "Dusk" theme scope.
2. `tokens.json` — the same tokens in a tool-agnostic JSON (Style-Dictionary-friendly)
   so they can be transformed for other platforms.
3. `styleguide.html` — a single self-contained page that RENDERS the whole system:
   color swatches w/ contrast ratios, type scale, spacing scale, every component in
   every state, light/dark toggle, and the Dusk theme toggle. This is the proof.
4. `README.md` — principles, usage, how to re-theme (swap primitives), token naming
   conventions, and contribution notes.
Use plain HTML/CSS (and minimal vanilla JS only for the toggles) so it's portable and
framework-agnostic. Keep everything self-hostable — no external CDNs, no tracking.

## 9. Process
First propose: (a) the recommended font pairing with rationale, and (b) the resolved
semantic color tokens for light+dark as a table with contrast ratios — and pause for
my confirmation BEFORE generating the full component CSS and styleguide page.
