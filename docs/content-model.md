# Content model

Schemas live in `src/content.config.ts` — note the file is at `src/content.config.ts`, **not** `src/content/config.ts`. Uses the Astro 5+ `glob()` loader API, not the legacy `type: 'content'` collection API.

## Current schema (verbatim)

```ts
const baseSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    subtitle: z.string().optional(),
    date: z.date(),
    draft: z.boolean(),              // required, no default — every entry must set it explicitly
    activeNav: z.enum(["~", "about", "projects", "posts", "contact"]),
    shortTitle: z.string().optional(),
    headings: z.array(z.object({ depth: z.number(), slug: z.string(), text: z.string() })).optional(),
    ai_use: z.array(z.enum(["gpt", "claude", "gemini", "grok", "qwen", "deepseek"])).optional(),
});

postsCollection    = baseSchema                                  // glob: src/content/posts/**/*.{md,mdx}
projectsCollection = baseSchema.extend({ github: z.string().optional() })  // NOT .url() — unvalidated string
```

`posts` and `stuff` were originally two separate collections with identical
schemas and near-duplicate routes/nav entries. They were merged into one
`posts` collection — the `stuff` collection, its routes, and its `~/stuff`
nav entry no longer exist.

## Fields

- `draft` has no default — omitting it is a schema validation error, not a silent `false`. This forces every entry to explicitly declare draft status.
- `github` on `projects` is a plain string, not URL-validated.
- `subtitle` — optional. When present, `PostLayout.astro` renders it as a `<p class="subtitle">` between the `<h1>` title and the date row, styled non-bold, base text size, rosewater color (`text-base font-normal text-ctp-rosewater`). Detail page only — `Card.astro` list views on `/posts` and `/projects` do not render it.
- `title`/`subtitle` inline formatting — both fields support a small hand-rolled inline syntax (not the full remark/rehype pipeline, which only runs on the article body): `**bold**`, `*italic*`, `~~strikethrough~~`, `++underline++` (non-standard — CommonMark/GFM has no underline syntax), `` `code` ``. Implemented in `src/utils/inlineMarkdown.ts` (`renderInlineMarkdown` / `stripInlineMarkdown`). Rendered as real HTML only on the detail page's `<h1>` and subtitle line (via `set:html`, escaped and regex-templated — no sanitizer needed since output only ever contains the 5 known tags). Everywhere else `title` is consumed as plain text — browser tab title, `<meta name="title">`, and `Card.astro` list rows on `/posts`/`/projects` — the syntax is stripped to plain text via `stripInlineMarkdown` so raw `**`/`~~`/`++` never leaks through. Math is explicitly not supported here.
- `activeNav` must match one of `~`/`about`/`projects`/`posts`/`contact` — this couples directly to `MENU` in `src/config.ts` and to nav-highlight logic in `Header.astro:42-47`, which does `menuItem.path.split("/").pop()` against the URL path segment to decide the active state. Changing `activeNav` enum values or `MENU` paths without updating the other will silently break nav highlighting.
- `headings` — optional manual override array. In `PostLayout.astro:36-40`: if `frontmatter.headings` is non-empty, it's used verbatim instead of the rendered headings from `entry.render()`. There's a TODO (`PostLayout.astro:14-15`) to accept only indices+overrides instead of the full array, not yet implemented.
- `ai_use` — optional list of AI tools that helped write the entry, one or more of `gpt`, `claude`, `gemini`, `grok`, `qwen`, `deepseek`. When present and non-empty, `PostLayout.astro` renders an attribution line ("`<icon> <name>` helped write this page.") left-aligned below the date row, above the article body. Icon/name mapping lives in `src/assets/aitools.ts`, sourced from `@lobehub/icons-static-svg` (raw `?raw` SVG imports, zero React dependency) and forced monochrome (`overlay0`) via `fill: currentColor !important` in `PostLayout.astro`'s scoped `<style>`.

## Scaffolding new content

`scripts/create.sh`, wired to `npm run create -- -c <posts|projects> <name>`:

- Writes a `.mdx` file to `src/content/<category>/<name>.mdx` with a frontmatter template.
- `date` is filled via `date -u +%Y-%m-%dT%H:%M:%SZ` (UTC, ISO 8601).
- Template writes `draft: False` (capital F). YAML parses this fine as boolean `false`, but it's inconsistent with the `z.boolean()` / JS `false` used everywhere else — a manual-edit trap if you copy the casing elsewhere.
- `headings:` and `github:` are left as commented-out placeholders in the template.
- `subtitle:` is not in the template at all (not even as a commented placeholder) — add it manually to frontmatter when needed.

## Rendering path

Each collection has its own dynamic route file — `src/pages/posts/[...slug].astro`, `src/pages/projects/[...slug].astro` (no generic `[collection]` segment). Each calls `getStaticPaths` over `getCollection(...)`, filters `draft`, and renders through `PostLayout`. Each collection also has its own `index.astro` for the listing page. `about.md`/`contact.md` are the exception — see `architecture.md`.

Each `[...slug].astro` also derives a `lastEdited` prop from `git log` on `entry.filePath` (via `getLastEditedDate` in `src/utils/git.ts`) and passes it to `PostLayout`, which renders it next to the creation date as "(last edited on `<date>`)" — this is **not** a schema field; it's computed at build time from git history, not authored in frontmatter. See `docs/build-and-deploy.md` for the full mechanism and its cache fallback.
