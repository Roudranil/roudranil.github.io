# CLAUDE.md

## Project

Personal portfolio site for Roudranil Das. Built with Astro 4, Tailwind CSS 3, deployed to GitHub Pages.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check + build (astro check && astro build)
npm run preview    # Preview production build
npm run sync-resume # Sync resume PDF from source
```

## Tech Stack

| Layer        | Tool                                   |
| ------------ | -------------------------------------- |
| Framework    | Astro 4 (SSG, content collections)     |
| Styling      | Tailwind CSS 3, @tailwindcss/typography |
| Theme        | Catppuccin Mocha (@catppuccin/tailwindcss) |
| Math         | KaTeX (remark-math + rehype-katex)     |
| Syntax       | Shiki (catppuccin-mocha theme)         |
| Content      | MDX, Markdown                          |
| Analytics    | Google Analytics via Partytown         |
| Deployment   | GitHub Pages (withastro/action)        |
| Fonts        | Computer Modern (body), Victor Mono Nerd Font (code) |

## Folder Structure

```
.
├── .claude/             # Claude Code config + memory
├── .github/workflows/   # GitHub Actions deploy pipeline
├── public/
│   ├── fonts/           # Self-hosted fonts (Computer Modern, Victor Mono, math)
│   ├── resume/          # Resume PDF
│   └── styles/          # Global CSS (KaTeX, fonts, remark, misc)
├── scripts/             # Utility shell scripts (sync-resume, create)
├── src/
│   ├── assets/          # Social icon SVGs
│   ├── components/      # Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Card.astro
│   │   ├── TextLink.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── Socials.astro
│   │   ├── TableOfContents.astro
│   │   ├── TableOfContentsHeading.astro
│   │   ├── GithubLink.astro
│   │   └── Block.astro
│   ├── content/         # Content collections
│   │   ├── posts/       # Blog posts (markdown/MDX)
│   │   ├── projects/    # Portfolio projects
│   │   ├── stuff/       # Miscellaneous content
│   │   └── config.ts    # Zod schemas
│   ├── layouts/
│   │   ├── BaseLayout.astro    # Root layout (head, analytics, ViewTransitions)
│   │   ├── PostLayout.astro    # Posts/projects/stuff (TOC + content)
│   │   ├── AboutLayout.astro   # About page (two-column with TOC)
│   │   └── ContactLayout.astro # Contact page (single-column)
│   ├── pages/           # File-based routing
│   │   ├── index.astro
│   │   ├── about.md
│   │   ├── contact.md
│   │   ├── 404.astro
│   │   ├── robots.txt.ts
│   │   ├── posts/
│   │   ├── projects/
│   │   └── stuff/
│   ├── styles/          # base.css (Tailwind directives)
│   ├── utils/           # Utility functions (buildTOC)
│   ├── config.ts        # Site metadata, nav menu, socials
│   └── types.ts         # TypeScript type definitions
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .prettierrc.mjs
└── package.json
```

## Path Aliases

`@assets`, `@components`, `@pages`, `@styles`, `@layouts`, `@config`, `@utils`

## Content Collections

All collections share: `title`, `description?`, `date`, `draft`, `activeNav`, `shortTitle?`, `headings?`

Projects additionally have: `github?`

## Commits

**Strictly follow the `git-commit` skill** (`.claude/skills/git-commit`). Key points:

- Conventional Commits format: `<type>(<scope>): <subject>`
- Imperative mood, no capital after colon, no trailing period, 50 char max subject
- Atomic commits — one logical change per commit
- Co-author footer mandatory on all AI-assisted commits

## Style

- Dark-only (no light mode)
- Color theme: Catppuccin Mocha
- Fonts: Computer Modern (body), Victor Mono Nerd Font (code)
- Academic/technical aesthetic — keep it minimal
