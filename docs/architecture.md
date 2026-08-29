# Architecture

## Folder map

```
.
├── .claude/             # Claude Code config: rules, memory, settings
├── .github/workflows/   # deploy.yml (auto-deploy main), release.yml (dev->main)
├── public/
│   ├── fonts/           # self-hosted fonts (Computer Modern, Victor Mono)
│   ├── resume/          # resume.pdf, synced from external repo
│   └── styles/          # katex-custom.css, loadfonts.css, remark-styles.css, miscellaneous-styles.css
├── scripts/             # create.sh, sync-resume.sh
├── src/
│   ├── assets/          # social icon SVGs
│   ├── components/      # Astro components
│   ├── content/         # posts/, projects/, stuff/ — markdown/mdx content
│   ├── content.config.ts  # Zod schemas + glob() loaders (repo root of src, not src/content/)
│   ├── layouts/         # BaseLayout, PostLayout, AboutLayout, ContactLayout
│   ├── pages/           # file-based routing, incl. about.md/contact.md (plain pages)
│   ├── styles/base.css  # Tailwind + theme + prose overrides
│   ├── utils/utils.js    # buildTOC (plain JS, only non-TS source file)
│   ├── config.ts        # SITE, MENU, SOCIALS
│   └── types.ts
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Path aliases

Defined in `tsconfig.json:9-16`:

| Alias | Resolves to |
|---|---|
| `@assets/*` | `src/assets/*` |
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@styles/*` | `src/styles/*` |
| `@layouts/*` | `src/layouts/*` |
| `@config` | `src/config.ts` (single file, no `/*`) |
| `@utils` | `src/utils/utils.js` (single file, no `/*`) |

`@utils` and `@config` map to one file each, not a directory. `@utils/anything` will not resolve — only `import { buildTOC } from "@utils"` works.

## Layout composition

All page-level layouts wrap `BaseLayout.astro`, they don't compose alongside it:

```
BaseLayout (html/head/body shell, analytics, ClientRouter, scroll-to-top)
└── Header + Breadcrumbs + <main>...<slot/>...</main>
```

- `PostLayout.astro` — used by `posts`/`projects`/`stuff` collection entries via each collection's own `src/pages/<collection>/[...slug].astro` (three separate route files, no generic `[collection]` segment). Two-column grid (`sm:grid-cols-7`): ToC in 2 cols, content in 5 cols, collapses to single column below `sm`.
- `AboutLayout.astro` — same two-column ToC grid pattern, used only by `src/pages/about.md`.
- `ContactLayout.astro` — single column, no ToC, used only by `src/pages/contact.md`.

`about.md` and `contact.md` are plain Markdown pages under `src/pages/`, not part of any content collection — they pick their layout via the frontmatter `layout:` field. This is a separate authoring pattern from `posts`/`projects`/`stuff`, which are content-collection entries under `src/content/` rendered through a dynamic `[...slug].astro` route. Both patterns coexist; there's no plan to unify them.

## Components

| Component | Purpose |
|---|---|
| `Block.astro` | Callout box (info/alert/tip/normal variants), colors from `base.css` theme tokens |
| `Breadcrumbs.astro` | Derives trail from `Astro.url.pathname`; last segment overridable via `shortTitle` prop |
| `Card.astro` | Link card for collection index listings (title + formatted date) |
| `Footer.astro` | Wraps `Socials` + "Powered by Astro" line |
| `GithubLink.astro` | Pill-style GitHub link, rendered in `PostLayout` when `frontmatter.github` is set |
| `Header.astro` | Top nav; reads `SITE`/`MENU` from `@config`; contains commented-out dead code (unused logo SVG, cursor-blink, alt underline) |
| `Socials.astro` | Renders social icons from `SOCIALS` config filtered by `active` |
| `TableOfContents.astro` | Wraps `buildTOC` output in a `<ul>` |
| `TableOfContentsHeading.astro` | Recursive TOC item, uses `<Astro.self>` for nesting; box-drawing glyphs via unicode escapes in CSS `content` |
| `TextLink.astro` | Generic styled `<a>` wrapper (color/underline/disabled props); used by `TableOfContentsHeading` |
