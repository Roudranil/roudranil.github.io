# Build & deploy

## npm scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` / `start` | `astro dev` | Local dev server |
| `build` | `astro check && astro build` | Type-check then build |
| `preview` | `astro preview` | Preview production build locally |
| `sync-resume` | `bash scripts/sync-resume.sh` | Pull resume PDF from external repo |
| `create` | `bash scripts/create.sh --` | Scaffold new content file |

There is no `sync-version` or `release` npm script — those scripts were deleted intentionally (see below). Don't reference them.

## `astro.config.mjs`

- `site: "https://roudranil.github.io"`, `compressHTML: true`.
- Markdown uses a custom `unified()` processor (`@astrojs/markdown-remark`) with `remarkPlugins: [remarkMath]`, `rehypePlugins: [rehypeKatex, [rehypeExpressiveCode, expressiveCodeConfig]]` — not the simpler top-level `markdown.remarkPlugins`/`rehypePlugins` keys. If adding a new remark/rehype plugin, add it inside the `unified({...})` call, not as a sibling config key.
- `markdown.syntaxHighlight: false` — Astro's built-in Shiki is turned off entirely; `rehype-expressive-code` owns syntax highlighting instead (see below). Do not re-enable `shikiConfig`, it has no effect once `syntaxHighlight` is `false`.

### Code block highlighting (Expressive Code)

- Package: `rehype-expressive-code` (+ `@expressive-code/core` as a direct dep for the custom plugin's `definePlugin` import). Deliberately **not** the `astro-expressive-code` Astro integration — that integration injects itself into `markdown.rehypePlugins` automatically, which doesn't work with this repo's hand-built `unified()` processor. Wiring the rehype plugin directly into the existing `rehypePlugins` array is the safer, convention-matching choice.
- `expressiveCodeConfig` (defined at the top of `astro.config.mjs`):
  - `themes: ["catppuccin-mocha"]` — a Shiki-bundled theme name, no explicit theme import needed.
  - `plugins: [pluginLanguageBadge()]` — custom plugin, see `src/plugins/expressive-code-language-badge.mjs`.
  - `styleOverrides`: `borderRadius`/`borderWidth`/`borderColor` reproduce the site's existing rounded-frame look; `codeFontFamily`/`uiFontFamily` are both set to `var(--font-mono)` so code content and the frame header/UI text use the site's Victor Mono Nerd Font, not Expressive Code's sans-serif UI default; `frames.inlineButtonBorderOpacity: "0"` removes a default border around the copy-to-clipboard button that didn't match the catppuccin-mocha theme.
- `src/plugins/expressive-code-language-badge.mjs` — custom Expressive Code plugin (`definePlugin`, hooks `preprocessMetadata` + `postprocessRenderedBlock`):
  - `preprocessMetadata` forces every code block's `frame` prop to `"code"`, unconditionally. This disables Expressive Code's terminal-frame auto-detection (which would otherwise render macOS-style traffic-light dots for shell/bash blocks) so every block gets one uniform header treatment.
  - `postprocessRenderedBlock` always pushes the `has-title` class onto the frame (so the header renders with its padded background even when no filename was given), then appends a `span.ec-lang-badge` (containing `span.ec-lang-icon` + `span.ec-lang-label`) into the header. This runs *after* the built-in Frames plugin's own hooks (Expressive Code's default plugins — Shiki, TextMarkers, Frames — are always prepended before any plugin passed in `plugins:`, so hook order is guaranteed), meaning a real `title="..."` meta string (rendered by Frames as a left-aligned filename tab) and this badge (rendered as a separately, absolutely-centered element — see `docs/styling.md`) never fight over the same DOM node.
  - `LANGUAGE_ICONS`/`LANGUAGE_LABELS` are small lookup maps keyed by Shiki language id (both full names like `javascript` and short aliases like `js`), with a generic fallback icon and an uppercased-id fallback label for anything unmapped.
- Fence-level authoring syntax (in `.md`/`.mdx` content): ` ```<lang> title="<filename>" ` shows a filename tab on the left; a plain ` ```<lang> ` fence (no `title`) shows just the centered language badge. The older `lang:title` colon convention (e.g. ` ```javascript:astro.config.mjs `) is retired — it was never wired to any active plugin — migrate any remaining uses to the `title="..."` form.
- Integrations: `mdx()`, `sitemap()`, `partytown({ config: { forward: ["dataLayer.push"] } })`. No `tailwind()` integration — Tailwind 4 comes in via `vite.plugins: [tailwindcss()]` instead.

## `scripts/sync-resume.sh`

Clones `github.com/Roudranil/resume.git` into `public/resume`, copies out only `resumev3/resume.pdf`, then deletes everything else including `.git`. Destructive to any local `public/resume` — it removes the directory first if it exists.

## Branching & release

- `main` — production. `.github/workflows/deploy.yml` triggers on push to `main` (or manual `workflow_dispatch`), builds via `withastro/action@v6`, deploys to GitHub Pages.
- `dev` — integration branch. All feature work merges here first. No direct commits to `main`.
- **Release flow is entirely `.github/workflows/release.yml`** (manual `workflow_dispatch`, no local script):
  1. Checks out full history, installs deps, runs `npm run build` as a sanity check.
  2. Reads version string from `./version` (repo-root file, not `package.json`).
  3. Merges `dev` into `main` with `--no-ff`, tags `v<version>`.
  4. Pushes `main` + tag, then merges `main` back into `dev` and pushes.

`scripts/release.sh`, `scripts/version.sh`, and the original `scripts/sync-version.sh` (which used to sync `./version` into `package.json`) were **deleted by the maintainer** — that local-script release workflow is retired in favor of the GitHub Actions flow above. Do not re-add them or reference them in docs/CLAUDE.md.
