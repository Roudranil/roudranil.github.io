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
- Markdown uses a custom `unified()` processor (`@astrojs/markdown-remark`) with `remarkPlugins: [remarkMath]`, `rehypePlugins: [rehypeKatex]` — not the simpler top-level `markdown.remarkPlugins`/`rehypePlugins` keys. If adding a new remark/rehype plugin, add it inside the `unified({...})` call, not as a sibling config key.
- `shikiConfig: { theme: "catppuccin-mocha" }`.
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
