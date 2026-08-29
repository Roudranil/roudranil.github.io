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

## Fonts

All fonts are self-hosted via `@font-face` in `base.css:207-337`:
- 12 faces for Computer Modern (serif/sans/typewriter, normal/italic/bold/bolditalic) from `/fonts/cm/*.ttf`.
- 6 faces for Victor Mono Nerd Font (regular/mono variants, normal/italic/bold) from `/fonts/VictorMonoNerdFont*.ttf`.

No Google Fonts or other external font CDN is used for these. (KaTeX CSS previously loaded from a CDN — see `build-and-deploy.md` for the fix that self-hosts it too.)

See `docs/aesthetic.md` for why post content is typeset this way (the LaTeX-document design language, alongside the site's terminal chrome).
