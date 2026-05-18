---
paths:
    - "**/*.astro"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.mjs"
    - "**/*.mdx"
---

# Astro/TypeScript Security

> This file extends [common/security.md](../common/security.md) with Astro and static site-specific content.

## Secrets Management

- Never hardcode API keys, GA Measurement IDs, or tokens in source code
- Use environment variables via Astro's built-in env support (`import.meta.env`)
- Prefix public env vars with `PUBLIC_` — they are inlined into client bundles; keep sensitive vars server-only (no `PUBLIC_` prefix, SSR-only access)
- Add `.env` and `.env.*` to `.gitignore`; commit `.env.example` with placeholder values only

```typescript
// BAD
const GA_ID = 'G-XXXXXXXXXX';

// GOOD — public env var (safe for client bundle, not secret)
const GA_ID = import.meta.env.PUBLIC_GA_ID;

// GOOD — server-only env var (SSR or build-time scripts only)
const API_SECRET = import.meta.env.API_SECRET;
```

## Content Security

- Never use `set:html` with untrusted or user-controlled content — it bypasses Astro's automatic HTML escaping
- MDX content is authored content, not user input — treat it as trusted, but review third-party MDX imports
- Sanitize any content sourced from external APIs before rendering

```astro
{/* BAD — bypasses escaping */}
<div set:html={userInput} />

{/* GOOD — auto-escaped */}
<div>{userInput}</div>

{/* OK — only for trusted authored content */}
<div set:html={entry.body} />
```

## External Resources

- Self-host all fonts and stylesheets — they live in `public/fonts/` and `public/styles/`; never load from external CDNs in production
- Any third-party `<script src>` must include `integrity` (SRI hash) and `crossorigin="anonymous"` attributes
- Partytown sandboxes Google Analytics in a worker — do not bypass Partytown for analytics scripts

```html
<!-- BAD — no integrity check -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- GOOD — SRI hash + crossorigin -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

## Input Validation

- This is an SSG site with no user input surfaces — validation applies to build-time data (content frontmatter, config)
- Zod schemas in `src/content.config.ts` validate all content frontmatter at build time; build fails on schema violations
- Validate any external data fetched at build time before using it in templates
- When adding server-side endpoints (Astro SSR), validate all query params and request bodies with Zod

```typescript
// Build-time external data — validate before use
const response = await fetch('https://api.example.com/data');
const raw = await response.json();

const schema = z.object({ title: z.string(), count: z.number() });
const data = schema.parse(raw); // throws on invalid shape
```

## Dependency Security

- Run `npm audit` regularly; the repo has a history of transitive vulnerabilities — keep dependencies updated
- Never install packages with known critical vulnerabilities; check `npm audit` output before committing `package-lock.json` changes
- Review new dependencies before adding them — this is a static site with minimal runtime surface; keep the dependency count low

## Logging

- No `console.log` of tokens, API keys, or PII in build scripts or config files
- Build-time logs are visible in CI — treat them as semi-public
- Use `console.warn` / `console.error` only for genuine build warnings and errors

## URL Safety

- Use `new URL(path, Astro.url)` for constructing absolute URLs — never string-concatenate URLs
- Validate slugs from `getStaticPaths` against the collection — they are generated from the filesystem, so collisions are the main risk
- Never construct navigation paths from raw user input (not applicable to SSG, but applies to any SSR endpoints added later)

## Build and Deploy Security

- GitHub Actions deploy workflow uses `withastro/action` — keep the action version pinned, not floating on `@latest`
- Review workflow changes carefully — the deploy workflow has write access to GitHub Pages
- Ensure `npm run build` passes cleanly before merging — a failed build should block the PR
