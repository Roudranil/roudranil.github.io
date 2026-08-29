# Styling

## Tailwind 4 wiring

- No `tailwind.config.mjs` — Tailwind 4 needs none. All config lives in `src/styles/base.css`.
- Wired via `@tailwindcss/vite` in `astro.config.mjs`'s `vite.plugins`, not the older `@astrojs/tailwind` integration.
- `base.css:1-3`: `@import "tailwindcss"` + `@import "@catppuccin/tailwindcss/mocha.css"` + `@plugin "@tailwindcss/typography"`.
- Scoped `<style>` blocks in `.astro` files need `@reference "@styles/base.css";` at the top to use Tailwind utilities/theme values (see `Header.astro:61`, `PostLayout.astro:96`).

## Theme tokens (`base.css:5-51`, `@theme` block)

- Three custom font families: `ComputerModernSans`, `ComputerModernRoman`, `VictorMonoNerdFont` (mapped to `font-sans`/`font-serif`/`font-mono`).
- Custom pixel-based `--font-size-*` scale — `--font-size-base: 20px`, not Tailwind's default rem scale.
- Custom breakpoint `--breakpoint-mywidth: 1023px`, used as the `mywidth:` variant throughout (`Header.astro`, layouts) for a width threshold distinct from the standard Tailwind breakpoints.
- One-off named colors (`--color-dark-rosewater`, `--color-dark-sapphire`, etc.) plus `info`/`alert`/`tip` bg/accent/titletext triplets consumed by `Block.astro`.

## Prose overrides quirk

`base.css:156-203` sits **outside** `@layer base`, with an explicit comment explaining why: the Tailwind Typography plugin's own cascade layer otherwise beats `@layer base` overrides on specificity, so anything meant to override `.prose` styling (link hover gradient, `--tw-prose-*` variable remapping to Catppuccin vars) must live at the top level of the stylesheet, not inside `@layer base`.

If you add new `.prose` overrides and they aren't taking effect, check whether they landed inside `@layer base` by mistake.

## Code block styling (Expressive Code)

Code fences render through `rehype-expressive-code`, not Astro's built-in Shiki — see `docs/build-and-deploy.md` for the pipeline wiring. The rendered markup is `div.expressive-code > figure.frame > figcaption.header + pre`, replacing what used to be a bare `.prose pre`:

- `base.css`'s `.prose pre` rule now only sets `margin-top: 0` — border/radius/background are owned by Expressive Code's `styleOverrides` (`astro.config.mjs`) instead of Tailwind Typography's `.prose pre`. Don't re-add border/radius rules to `.prose pre`; edit `styleOverrides` in `astro.config.mjs` instead.
- The `--tw-prose-pre-bg` / `--tw-prose-pre-code` CSS-variable overrides were removed from the `.prose` block (`base.css`) for the same reason — Expressive Code's own theme background/foreground on `<pre>` takes precedence regardless, so keeping them was misleading dead code.
- `.prose pre::-webkit-scrollbar` became `.expressive-code pre::-webkit-scrollbar` — the scrollbar-hiding rule now targets Expressive Code's inner `<pre>` specifically, since `.prose pre` selectors reach *any* `<pre>` inside prose content, not just code-block ones.
- `.expressive-code .header` is forced `position: relative`, and `.expressive-code .ec-lang-badge` is absolutely centered (`inset-inline-start: 50%; top: 50%; transform: translate(-50%, -50%)`) inside it. This decouples the language icon+name badge from Expressive Code's own filename-tab flex layout — without this, the badge would render inline next to a filename tab and get visually squeezed by the tab's own padding/background. The badge always uses `font-family: "VictorMonoNerdFont"` directly (not `var(--font-mono)`) because the nerd-font icon glyphs live in the private-use-area codepoints of that specific font file, and `var(--font-mono)`'s fallback chain wouldn't guarantee the same font resolves for the icon span.
- `.expressive-code .copy button` gets `opacity: 0.75 !important` — Expressive Code's default copy button is hover-only (`opacity: 0` until the frame is hovered/focused); this override makes it always visible, matching this site's "always show the copy button" design choice rather than Expressive Code's editor-hover-affordance default.

See `docs/quirks.md` for two non-obvious gotchas in this area: dev-server restarts and nerd-font codepoint entry.

## Fonts

All fonts are self-hosted via `@font-face` in `base.css:207-337`:
- 12 faces for Computer Modern (serif/sans/typewriter, normal/italic/bold/bolditalic) from `/fonts/cm/*.ttf`.
- 6 faces for Victor Mono Nerd Font (regular/mono variants, normal/italic/bold) from `/fonts/VictorMonoNerdFont*.ttf`.

No Google Fonts or other external font CDN is used for these. (KaTeX CSS previously loaded from a CDN — see `build-and-deploy.md` for the fix that self-hosts it too.)

See `docs/aesthetic.md` for why post content is typeset this way (the LaTeX-document design language, alongside the site's terminal chrome).
