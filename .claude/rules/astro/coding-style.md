---
paths:
    - "**/*.astro"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.mdx"
    - "**/astro.config.mjs"
    - "**/tailwind.config.mjs"
---

# Astro/TypeScript Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Astro and TypeScript-specific content.

## Formatting

- **Prettier** for all `.astro`, `.ts`, `.tsx`, `.mdx`, `.mjs` files — config is in `.prettierrc.mjs`
- Line length: 100 characters (see `.prettierrc.mjs`)
- Trailing commas on multi-line argument/parameter lists
- Single quotes for strings in TypeScript; Prettier enforces this

## Immutability

- Prefer `const` for all declarations; use `let` only when reassignment is necessary
- Never use `var`
- Use `as const` for literal object/array constants to prevent widening
- Treat props and content collection entries as read-only — never mutate them

```typescript
// BAD
var count = 0;
let items = ['a', 'b'];

// GOOD
const count = 0;
const items = ['a', 'b'] as const;
```

## Naming

Follow TypeScript conventions consistent with the codebase:

- `camelCase` for variables, parameters, and functions
- `PascalCase` for types, interfaces, and Astro component filenames
- `kebab-case` for content slugs, CSS class names, and file names (non-component)
- `SCREAMING_SNAKE_CASE` for top-level constants
- Prefix boolean variables with `is`, `has`, `should`, or `can`

## Type Safety

- Never use `any` — use `unknown` for truly unknown types and narrow with type guards
- Avoid non-null assertions (`!`) — prefer optional chaining (`?.`), nullish coalescing (`??`), or early-return guards
- Use `satisfies` instead of `as` when you want type-checking without widening
- Zod schemas in `src/content.config.ts` are the source of truth for content types — infer from them with `z.infer<>`

```typescript
// BAD — crashes at runtime if entry is undefined
const title = entry!.data.title;

// GOOD — null-aware access
const title = entry?.data.title ?? 'Untitled';

// GOOD — early-return guard
function getTitle(entry: CollectionEntry<'posts'> | undefined): string {
  if (!entry) return 'Untitled';
  return entry.data.title;
}
```

## Union Types and Discriminated Unions

Use discriminated unions to model closed state variants:

```typescript
type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Always handle all variants — TypeScript enforces exhaustiveness with never
function render<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case 'loading': return 'Loading...';
    case 'success': return String(state.data);
    case 'error': return state.error.message;
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${_exhaustive}`);
    }
  }
}
```

## Error Handling

- Use typed error handling — catch specific error types where possible
- Never swallow errors silently
- Use `Result`-style types for recoverable errors in utility functions
- At build time (Astro SSG), let errors propagate — they will surface as build failures

```typescript
// BAD
try {
  await fetchData();
} catch (e) {
  console.log(e);
}

// GOOD
try {
  await fetchData();
} catch (e) {
  if (e instanceof NetworkError) {
    console.error('Network error:', e.message);
  } else {
    throw e; // re-throw unexpected errors
  }
}
```

## Async / Promises

- Always `await` Promises or explicitly mark fire-and-forget intent
- Never mark a function `async` if it never `await`s anything
- Use `Promise.all` for concurrent independent async operations
- In Astro frontmatter, all `await` calls are fine — they run at build time

```typescript
// BAD — ignoring Promise
fetchData();

// GOOD
await fetchData();

// GOOD — concurrent
const [posts, projects] = await Promise.all([
  getCollection('posts'),
  getCollection('projects'),
]);
```

## Imports

- Use configured path aliases (`@components`, `@utils`, `@config`, `@layouts`, `@styles`, `@assets`) — never relative `../` chains longer than one level
- Order: external packages → internal aliases → relative imports
- No unused imports

## Astro Component Style

- All data fetching goes in the frontmatter (`---` block), not inline in templates
- Use `Astro.props` with a typed `interface Props` at the top of each component
- Pass data down as props — avoid querying collections inside deeply nested components
- Use `<slot />` for composable layouts; named slots for multiple injection points

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
  <slot />
</article>
```

## Tailwind Usage

- Use Tailwind utility classes exclusively — no inline `style=""` attributes unless absolutely necessary
- Use Catppuccin Mocha tokens from `tailwind.config.mjs` for colors (e.g., `text-ctp-text`, `bg-ctp-base`)
- Use the `@apply` directive in CSS only for genuinely repeated patterns; prefer component extraction otherwise
- Dark mode is the only mode — no `dark:` prefix needed; the theme is always dark

## JSDoc / TSDoc Style

- Use `/** */` for documentation comments on exported functions, types, and constants
- Write in imperative mood for functions ("Returns the…", "Builds the…")
- One concise summary sentence; add a paragraph only if behavior is non-obvious
- Document parameters only when their purpose is not self-evident from the name

```typescript
/**
 * Builds a table-of-contents tree from a flat list of headings.
 *
 * Headings must be in document order; depth must be 1–6.
 */
export function buildTOC(headings: MarkdownHeading[]): TOCEntry[] { ... }
```

### Final Enforcement Rule

If a public API element (exported function, type alias, or constant) has non-obvious behavior, it MUST have a JSDoc comment. Pure pass-through re-exports and self-evident one-liners do not require documentation.
