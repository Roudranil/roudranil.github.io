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

## Git-derived footer + "last edited" metadata

`src/utils/git.ts` provides four build-time functions, all backed by shelling
out to `git` via `child_process.execSync`. No dependency needed — Node's
builtin is enough.

- `isGitAvailable()` — memoized check that `git rev-parse --short HEAD`
  succeeds against the checkout. Every other export in the module is
  meaningless if this is `false` (no `.git`, or `git` binary missing).
- `getCommitHash()` — short hash of the checked-out `HEAD`, or `null`.
- `getBranchName()` — current branch name, or `null` if git is unavailable
  or `HEAD` is detached (`git rev-parse --abbrev-ref HEAD` prints the literal
  string `"HEAD"` in that case, which is filtered out).
- `getLastEditedDate(filePath)` — commit date of the latest commit reachable
  from `HEAD` that touched `filePath` (project-root-relative, e.g.
  `src/content/posts/foo.mdx`). See "Last-edited cache" below for its
  fallback behavior.

`REPO_ROOT`/`CACHE_PATH` inside `git.ts` are anchored to `process.cwd()`, not
`import.meta.url` — see the quirk in `docs/quirks.md` for why.

### Footer: commit hash + branch

`astro.config.mjs` calls `getCommitHash()`/`getBranchName()` once at
config-eval time (this happens on every `astro dev` start and every
`astro build` — not per-page) and injects the results into
`import.meta.env` via `vite.define`:

```js
define: {
    "import.meta.env.PUBLIC_GIT_HASH": JSON.stringify(gitHash ?? ""),
    "import.meta.env.PUBLIC_GIT_BRANCH": JSON.stringify(gitBranch ?? ""),
},
```

This is the same mechanism `BaseLayout.astro` already uses for
`PUBLIC_GOOGLE_SITE_VERIFICATION`, just injected via `define` instead of a
`.env` file, since the value has to be computed by code, not stored as a
static string. Empty string means "unavailable" — `import.meta.env` values
must be strings, `null` can't be injected directly.

`Footer.astro` reads both vars and renders a `·` separator, a placeholder
nerd-font branch-icon glyph, the hash, and `(branch)` — wrapped together in
one link to `https://github.com/Roudranil/roudranil.github.io/tree/<hash>`
(the repo tree at that commit), styled to match the surrounding "Powered by
Astro" text (`text-ctp-peach no-underline`, no default link styling) — only
when `PUBLIC_GIT_HASH` is non-empty. If git is unavailable, the whole
cluster (dot, icon, hash, branch, link) is omitted, not just the hash.

### Last-edited date on posts/projects

`src/pages/posts/[...slug].astro` and `src/pages/projects/[...slug].astro`
call `getLastEditedDate(entry.filePath)` per page (glob-loader collection
entries expose `filePath`, project-root-relative) and pass the result as a
`lastEdited` prop to `PostLayout.astro`. `PostLayout` only renders the
"(last edited on `<date>`)" clause when `lastEdited` is non-null **and**
differs from the frontmatter `date` by calendar day — a file whose only
commit is its creation commit shows no last-edited clause. Both dates render
inside `<time datetime="...">` for machine-readable SEO metadata.

### Last-edited cache

`src/data/last-edited-cache.json` — a committed JSON map of
`filePath -> ISO date`, starting as `{}`. It exists because `git log --
<file>` can come back empty for reasons that have nothing to do with
whether the file was actually edited: an untracked file, or (before the fix
below) a shallow CI checkout. `getLastEditedDate()`:

1. Tries a real `git log -1 --format=%cI -- <filePath>` first.
2. On success: uses that date, and if it differs from what's cached,
   rewrites `last-edited-cache.json` (sorted, pretty-printed) — this is how
   the cache self-heals on any build with full git history.
3. On empty output (git log found nothing): falls back to whatever's in the
   cache for that `filePath`, or `null` if there's no entry either — in
   which case no "last edited" clause renders at all.

The cache rewrite is a normal source-tree change reviewed and committed like
a lockfile update. The GitHub Pages deploy build never pushes anything back
to the repo, so the self-heal only matters for local `npm run dev`/`build`
runs — it's a safety net for CI edge cases, not something a developer needs
to babysit.

## `scripts/sync-resume.sh`

Clones `github.com/Roudranil/resume.git` into `public/resume`, copies out only `resumev3/resume.pdf`, then deletes everything else including `.git`. Destructive to any local `public/resume` — it removes the directory first if it exists.

## Branching & release

- `main` — production. `.github/workflows/deploy.yml` triggers on push to `main` (or manual `workflow_dispatch`), builds via `withastro/action@v6`, deploys to GitHub Pages. Its `actions/checkout@v4` step uses `fetch-depth: 0` (full history) — required for `getLastEditedDate()`'s per-file `git log` to work; the default shallow (depth 1) checkout only has `HEAD`, which is enough for the commit-hash feature but not for walking a file's history. `release.yml`'s own `npm run build` (a pre-merge sanity check, output discarded, see below) already used `fetch-depth: 0` before this feature existed, so it needed no change.
- `dev` — integration branch. All feature work merges here first. No direct commits to `main`.
- **Release flow is entirely `.github/workflows/release.yml`** (manual `workflow_dispatch`, no local script):
  1. Checks out full history, installs deps, runs `npm run build` as a sanity check.
  2. Reads version string from `./version` (repo-root file, not `package.json`).
  3. Merges `dev` into `main` with `--no-ff`, tags `v<version>`.
  4. Pushes `main` + tag, then merges `main` back into `dev` and pushes.

`scripts/release.sh`, `scripts/version.sh`, and the original `scripts/sync-version.sh` (which used to sync `./version` into `package.json`) were **deleted by the maintainer** — that local-script release workflow is retired in favor of the GitHub Actions flow above. Do not re-add them or reference them in docs/CLAUDE.md.
