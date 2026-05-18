---
paths:
    - "**/*.astro"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.mdx"
    - "**/astro.config.mjs"
    - "**/tailwind.config.mjs"
---

# Astro/TypeScript coding review checklist

When writing Astro or TypeScript code, always make sure below items are followed thoroughly.

### Architecture (CRITICAL)

- **Business logic in templates** — complex logic belongs in the frontmatter script or utility modules, not inline in Astro templates
- **Cross-layer imports** — pages should not import directly from other pages; share logic through `src/utils/` or `src/components/`
- **Circular dependencies** — module A depends on B and B depends on A
- **Direct content collection queries in components** — prefer passing data as props; query in pages/layouts
- **Missing abstractions at layer boundaries** — duplicated data-fetching or transform logic across pages

### Content Collections (CRITICAL)

- **Missing schema validation** — all collections must have Zod schemas defined in `src/content.config.ts`
- **Non-exhaustive field handling** — optional fields (`description?`, `github?`) must be handled where rendered
- **Draft posts leaking to production** — filter `draft: true` entries in all collection queries
- **Stale `headings?` field** — manually set headings must match actual document structure
- **Missing `activeNav` field** — every content entry must set `activeNav` for correct nav highlighting

### Component Composition (HIGH)

- **Oversized Astro templates** — templates exceeding ~80 lines of markup; extract subtrees to separate components
- **Inline styles over Tailwind** — use Tailwind utility classes, not `style=""` attributes
- **Hardcoded colors** — use Catppuccin Mocha tokens from `tailwind.config.mjs`, not raw hex values
- **Hardcoded spacing** — use Tailwind spacing scale, not magic pixel values
- **Missing `shortTitle` for long titles** — nav and breadcrumbs truncate; provide `shortTitle` when title is long

### Performance (HIGH)

- **Unoptimized images** — use Astro's `<Image />` component for automatic optimization, not raw `<img>`
- **Missing `loading="lazy"` on below-fold images** — Astro's `<Image />` handles this, but raw `<img>` tags must set it manually
- **Unnecessary client-side JS** — Astro is SSG-first; avoid `client:load` directives unless interactivity is truly needed
- **Large inline scripts** — move scripts to external files; avoid blocking the parser
- **KaTeX in non-math pages** — KaTeX CSS is global; don't add math markup to pages that don't need it

### TypeScript Idioms (MEDIUM)

- **`any` type usage** — use proper types or `unknown`; never `any`
- **Non-null assertions (`!`)** — prefer optional chaining (`?.`), nullish coalescing (`??`), or type guards
- **`var` where `const`/`let` works** — always prefer `const`; use `let` only when reassignment is necessary
- **Implicit return types on exported functions** — public utility functions must have explicit return types
- **Unused imports** — remove all unused imports; TypeScript compiler and ESLint enforce this

### Resource & Build (HIGH)

- **Broken path aliases** — use configured aliases (`@components`, `@utils`, `@config`, etc.) consistently; no relative `../` chains
- **Missing `export`** — utility functions intended for reuse must be exported from their module
- **Font files not self-hosted** — all fonts are in `public/fonts/`; never load fonts from external CDNs
- **KaTeX CSS loaded from CDN** — KaTeX styles live in `public/styles/`; never reference unpkg/cdnjs
- **Uncommitted content config** — changes to `src/content.config.ts` must be committed alongside content schema changes

### Error Handling (HIGH)

- **Missing 404 handling** — dynamic routes (`[...slug].astro`) must handle the case where `getStaticPaths` returns no matching entry
- **Unhandled collection query errors** — wrap `getCollection` calls in try/catch if used outside of build-time static generation
- **Raw errors reaching rendered output** — never render raw exception messages to the page

### Testing (HIGH)

- **Untested utility functions** — functions in `src/utils/` must have unit tests if they contain non-trivial logic
- **Build not verified after changes** — always run `npm run build` before marking a change complete; type errors surface here via `astro check`
- **Broken MDX** — verify MDX pages render without errors after adding or modifying frontmatter schemas

### Accessibility (MEDIUM)

- **Missing `alt` on images** — every `<img>` and `<Image />` must have a descriptive `alt` attribute
- **Icon-only links without labels** — social/icon links must have `aria-label` or visible text
- **Low contrast text** — Catppuccin Mocha palette is designed for contrast; don't override text/background colors with lower-contrast alternatives
- **Missing `lang` on `<html>`** — `BaseLayout.astro` must set `lang="en"` (or appropriate locale)
- **Non-semantic heading hierarchy** — headings must be sequential (`h1` → `h2` → `h3`); don't skip levels

### Navigation & Routing (MEDIUM)

- **Hardcoded URLs** — use `src/config.ts` site metadata for the base URL; never hardcode `https://roudranil.github.io`
- **Broken `activeNav` highlighting** — `activeNav` in frontmatter must match the key used in the nav menu config in `src/config.ts`
- **Missing breadcrumbs on deep pages** — post/project/stuff detail pages must include `<Breadcrumbs />`
- **Slug collisions** — ensure no two content entries in the same collection share a slug

### Security (CRITICAL)

- **Hardcoded secrets** — API keys, GA measurement IDs, or tokens must not be committed in source; use environment variables
- **Unescaped user-controlled content in `set:html`** — never use `set:html` with untrusted input; Astro auto-escapes by default, don't bypass it
- **External scripts without integrity hashes** — any third-party `<script src>` must include `integrity` + `crossorigin` attributes
- **Sensitive logging** — no `console.log` of tokens, PII, or credentials in build scripts or server-side code
