---
paths:
    - "**/*.astro"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.test.ts"
    - "**/*.spec.ts"
---

# Astro/TypeScript Testing

## Current practice

No test runner is installed in this repo (`package.json` has no Vitest or other test dependency, no `*.test.ts` files exist). The primary correctness gate today is:

- `npm run build` (`astro check && astro build`) — type-checks every `.astro`/`.ts` file and fails the build on type errors or broken content schemas
- Manual verification via `npm run dev` for layout/component/visual changes

Everything below is guidance for **if/when a test suite is added** — it is not describing an existing setup. Don't assume Vitest is available; check `package.json` before writing a test file.

## Test Framework (if adopted)

- **Vitest** — test runner, compatible with Vite/Astro's build pipeline
- **@testing-library/dom** — for DOM assertions if component testing is added
- **zod** — schema tests can be written as plain unit tests against the Zod schemas
- **astro check** — type-checks all `.astro` files; run as part of `npm run build`

## Test Types

| Type         | Tool               | Location           | When to Write                                      |
| ------------ | ------------------ | ------------------ | -------------------------------------------------- |
| Unit         | Vitest             | `src/**/*.test.ts` | All utility functions in `src/utils/`              |
| Schema       | Vitest             | `src/**/*.test.ts` | Content collection Zod schemas                     |
| Build        | `astro check`      | CI                 | Type-checks all `.astro` files on every build      |
| Visual       | Manual             | Browser            | Layout/component changes — verify in `npm run dev` |

## Unit Tests: Utility Functions

```typescript
// src/utils/buildTOC.test.ts
import { describe, it, expect } from 'vitest';
import { buildTOC } from './buildTOC';

describe('buildTOC', () => {
  it('returns empty array for no headings', () => {
    expect(buildTOC([])).toEqual([]);
  });

  it('nests h3 under h2', () => {
    const headings = [
      { depth: 2, slug: 'intro', text: 'Intro' },
      { depth: 3, slug: 'sub', text: 'Sub' },
    ];
    const toc = buildTOC(headings);
    expect(toc).toHaveLength(1);
    expect(toc[0].children).toHaveLength(1);
    expect(toc[0].children[0].slug).toBe('sub');
  });

  it('treats sequential h2s as siblings', () => {
    const headings = [
      { depth: 2, slug: 'a', text: 'A' },
      { depth: 2, slug: 'b', text: 'B' },
    ];
    expect(buildTOC(headings)).toHaveLength(2);
  });
});
```

## Schema Tests: Content Collections

Validate that Zod schemas accept valid data and reject invalid data:

```typescript
// src/content.config.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  date: z.date(),
  draft: z.boolean().default(false),
  activeNav: z.string(),
});

describe('post schema', () => {
  it('accepts a valid post', () => {
    const result = postSchema.safeParse({
      title: 'Hello',
      date: new Date(),
      draft: false,
      activeNav: 'posts',
    });
    expect(result.success).toBe(true);
  });

  it('defaults draft to false when omitted', () => {
    const result = postSchema.parse({
      title: 'Hello',
      date: new Date(),
      activeNav: 'posts',
    });
    expect(result.draft).toBe(false);
  });

  it('rejects missing title', () => {
    const result = postSchema.safeParse({ date: new Date(), activeNav: 'posts' });
    expect(result.success).toBe(false);
  });
});
```

## Fakes Over Mocks

For tests that need collection-like data, use in-memory fakes rather than mocking `getCollection`:

```typescript
// test helpers
function makePost(overrides: Partial<PostData> = {}): PostData {
  return {
    title: 'Test Post',
    date: new Date('2024-01-01'),
    draft: false,
    activeNav: 'posts',
    ...overrides,
  };
}

// usage
it('filters out drafts', () => {
  const posts = [makePost({ draft: false }), makePost({ draft: true })];
  const visible = posts.filter((p) => !p.draft);
  expect(visible).toHaveLength(1);
});
```

## Build Verification

The primary correctness check for this SSG project is a clean build:

```bash
# Type-check all .astro files and build
npm run build     # runs: astro check && astro build

# Type-check only (faster, no build output)
npx astro check
```

Always run `npm run build` after:
- Changes to `src/content.config.ts` (schema changes)
- Changes to `src/config.ts` (nav, socials)
- New layouts or components
- Changes to `astro.config.mjs`

## Test Naming

Use descriptive, behavior-focused names:

```typescript
it('returns null when entry does not exist', () => { ... });
it('sorts posts by date descending', () => { ... });
it('excludes draft posts from output', () => { ... });
it('throws ZodError when title is missing', () => { ... });
```

## Test Organization

```
src/
├── utils/
│   ├── buildTOC.ts
│   └── buildTOC.test.ts   # co-located with source
├── content.config.ts
└── content.config.test.ts
```

Co-locate tests with source files. A dedicated `test/` directory is not needed for a project of this size.

## Coverage

- All non-trivial utility functions in `src/utils/` must have unit tests
- Schema validation logic (custom Zod refinements) must be tested
- Run `npx vitest --coverage` to check coverage; aim for 80%+ on `src/utils/`
- Build-time type coverage is enforced by `astro check` — treat type errors as test failures
