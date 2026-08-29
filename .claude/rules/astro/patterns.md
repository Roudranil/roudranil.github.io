---
paths:
    - "**/*.astro"
    - "**/*.ts"
    - "**/*.tsx"
    - "**/*.mdx"
    - "**/astro.config.mjs"
---

# Astro/TypeScript Patterns

## Content Collection Query Pattern

Centralize all collection queries in pages or layouts, not in leaf components:

```typescript
// In a page (src/pages/posts/index.astro)
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts', ({ data }) => !data.draft);
const sorted = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

Pass the result down as props to components:

```astro
// In a component (src/components/Card.astro)
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'posts'>;
}
const { entry } = Astro.props;
---
<a href={`/posts/${entry.slug}`}>{entry.data.title}</a>
```

## Static Paths Pattern

All dynamic routes use `getStaticPaths` to pre-render every slug at build time:

```astro
---
import { getCollection } from 'astro:content';
import type { GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
};

const { entry } = Astro.props;
const { Content, headings } = await entry.render();
---
```

## Layout Composition Pattern

Layouts wrap pages via the `layout` frontmatter property or by explicit import:

```astro
---
// PostLayout.astro
import BaseLayout from './BaseLayout.astro';
import TableOfContents from '@components/TableOfContents.astro';
import type { MarkdownHeading } from 'astro';

interface Props {
  title: string;
  description?: string;
  headings: MarkdownHeading[];
}

const { title, description, headings } = Astro.props;
---
<BaseLayout {title} {description}>
  <aside slot="toc">
    <TableOfContents {headings} />
  </aside>
  <slot />
</BaseLayout>
```

## Utility Function Pattern

Keep utility functions pure and typed in `src/utils/`:

```typescript
// src/utils/buildTOC.ts
import type { MarkdownHeading } from 'astro';

export interface TOCEntry {
  depth: number;
  slug: string;
  text: string;
  children: TOCEntry[];
}

export function buildTOC(headings: MarkdownHeading[]): TOCEntry[] {
  const toc: TOCEntry[] = [];
  const stack: TOCEntry[] = [];

  for (const heading of headings) {
    const entry: TOCEntry = { ...heading, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= heading.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      toc.push(entry);
    } else {
      stack[stack.length - 1].children.push(entry);
    }
    stack.push(entry);
  }

  return toc;
}
```

## Site Config Pattern

All site-wide metadata lives in `src/config.ts` — never hardcode values in templates:

```typescript
// src/config.ts
export const SITE = {
  title: 'Roudranil Das',
  description: '...',
  url: 'https://roudranil.github.io',
  author: 'Roudranil Das',
} as const;

export const NAV_MENU = [
  { label: 'Posts', href: '/posts', key: 'posts' },
  { label: 'Projects', href: '/projects', key: 'projects' },
  { label: 'Stuff', href: '/stuff', key: 'stuff' },
  { label: 'About', href: '/about', key: 'about' },
] as const;
```

## Content Schema Pattern

Zod schemas in `src/content.config.ts` are the single source of truth for content types. This mirrors the actual current schema — keep this example in sync with the real file, don't let it drift:

```typescript
// src/content.config.ts
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  draft: z.boolean(),          // no default — every entry must set it explicitly
  activeNav: z.enum(['~', 'about', 'stuff', 'projects', 'posts', 'contact']),
  shortTitle: z.string().optional(),
  headings: z.array(z.object({ depth: z.number(), slug: z.string(), text: z.string() })).optional(),
});

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: baseSchema,
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: baseSchema.extend({
    github: z.string().optional(), // plain string, not URL-validated
  }),
});

export const collections = { posts: postsCollection, projects: projectsCollection };
```

Uses the Astro 5+ `glob()` loader API — not the legacy `type: 'content'` collection API. `draft` has no `.default()`: omitting it is a validation error, not a silent `false`. `github` is deliberately unvalidated as a URL.

Infer types from the schema — never write parallel type definitions:

```typescript
import type { z } from 'astro:content';
import type { collections } from '../content.config';

type PostData = z.infer<typeof collections.posts.schema>;
```

## Component Props Pattern

Every Astro component declares a typed `interface Props`:

```astro
---
interface Props {
  title: string;
  href: string;
  description?: string;
  isExternal?: boolean;
}

const { title, href, description, isExternal = false } = Astro.props;
---

<a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
  {title}
  {description && <span class="text-ctp-subtext0">{description}</span>}
</a>
```

## Conditional Rendering Pattern

Use short-circuit and ternary — keep templates readable:

```astro
---
const { github, description } = Astro.props;
---

{/* Short-circuit for optional elements */}
{description && <p class="text-ctp-subtext1">{description}</p>}

{/* Ternary for two-branch rendering */}
{github
  ? <a href={github} class="text-ctp-blue">View on GitHub</a>
  : <span class="text-ctp-overlay0">No repository</span>
}
```

## Table of Contents Pattern

Generate TOC from rendered headings, not from frontmatter (headings field is legacy):

```astro
---
import { buildTOC } from '@utils/buildTOC';
import TableOfContents from '@components/TableOfContents.astro';

const { Content, headings } = await entry.render();
const toc = buildTOC(headings);
---

<aside>
  <TableOfContents headings={toc} />
</aside>
<article>
  <Content />
</article>
```

## Astro Config Extensions

New integrations and remark/rehype plugins go in `astro.config.mjs`. Keep additions minimal and document why each plugin is needed. This repo uses a custom `unified()` markdown processor (not the simpler top-level `markdown.remarkPlugins`/`rehypePlugins` keys) and wires Tailwind 4 via its Vite plugin, not `@astrojs/tailwind`:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: { theme: 'catppuccin-mocha' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

New remark/rehype plugins go inside the `unified({...})` call, not as sibling `markdown.*` keys.

## References

See `src/content.config.ts` for collection schemas.
See `src/config.ts` for site metadata, nav menu, and social links.
See `src/utils/` for shared utility functions.
