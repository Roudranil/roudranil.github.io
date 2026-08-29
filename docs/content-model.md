# Content model

Schemas live in `src/content.config.ts` — note the file is at `src/content.config.ts`, **not** `src/content/config.ts`. Uses the Astro 5+ `glob()` loader API, not the legacy `type: 'content'` collection API.

## Current schema (verbatim)

```ts
const baseSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    draft: z.boolean(),              // required, no default — every entry must set it explicitly
    activeNav: z.enum(["~", "about", "projects", "posts", "contact"]),
    shortTitle: z.string().optional(),
    headings: z.array(z.object({ depth: z.number(), slug: z.string(), text: z.string() })).optional(),
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
- `activeNav` must match one of `~`/`about`/`projects`/`posts`/`contact` — this couples directly to `MENU` in `src/config.ts` and to nav-highlight logic in `Header.astro:42-47`, which does `menuItem.path.split("/").pop()` against the URL path segment to decide the active state. Changing `activeNav` enum values or `MENU` paths without updating the other will silently break nav highlighting.
- `headings` — optional manual override array. In `PostLayout.astro:36-40`: if `frontmatter.headings` is non-empty, it's used verbatim instead of the rendered headings from `entry.render()`. There's a TODO (`PostLayout.astro:14-15`) to accept only indices+overrides instead of the full array, not yet implemented.

## Scaffolding new content

`scripts/create.sh`, wired to `npm run create -- -c <posts|projects> <name>`:

- Writes a `.mdx` file to `src/content/<category>/<name>.mdx` with a frontmatter template.
- `date` is filled via `date -u +%Y-%m-%dT%H:%M:%SZ` (UTC, ISO 8601).
- Template writes `draft: False` (capital F). YAML parses this fine as boolean `false`, but it's inconsistent with the `z.boolean()` / JS `false` used everywhere else — a manual-edit trap if you copy the casing elsewhere.
- `headings:` and `github:` are left as commented-out placeholders in the template.

## Rendering path

Each collection has its own dynamic route file — `src/pages/posts/[...slug].astro`, `src/pages/projects/[...slug].astro` (no generic `[collection]` segment). Each calls `getStaticPaths` over `getCollection(...)`, filters `draft`, and renders through `PostLayout`. Each collection also has its own `index.astro` for the listing page. `about.md`/`contact.md` are the exception — see `architecture.md`.
