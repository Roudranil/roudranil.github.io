# CLAUDE.md

## Project

Personal portfolio site for Roudranil Das. Built with Astro 6, Tailwind CSS 4, deployed to GitHub Pages.

## Working Procedure

Standard workflow for changes/fixes/improvements:

1. Create a feature branch from `main`
2. Make changes, commit atomically (see Commits section)
3. Push branch
4. Generate/update `.pr.md` at repo root with PR title and body (following §9 of git-commit skill)
   - If `.pr.md` already exists and the branch is not yet merged, update it to reflect new commits
5. Report back

### Before every commit

1. Read the `git-commit` skill (`.claude/skills/git-commit/SKILL.md`)
2. Run through the pre-commit checklist (§10 of the skill)
3. Use the HEREDOC template for the commit message

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check + build (astro check && astro build)
npm run preview    # Preview production build
npm run sync-resume # Sync resume PDF from source
npm run create     # Scaffold new content via scripts/create.sh
```

## Tech Stack

| Layer        | Tool                                   |
| ------------ | -------------------------------------- |
| Framework    | Astro 6 (SSG, Content Layer API)       |
| Styling      | Tailwind CSS 4 via @tailwindcss/vite   |
| Theme        | Catppuccin Mocha (@catppuccin/tailwindcss) |
| Math         | KaTeX (remark-math + rehype-katex)     |
| Syntax       | Shiki (catppuccin-mocha, built-in)     |
| Content      | MDX, Markdown                          |
| Analytics    | Google Analytics via Partytown         |
| Deployment   | GitHub Pages (withastro/action@v6)     |
| Fonts        | Computer Modern (body), Victor Mono Nerd Font (code) |
| Node         | 22 (pinned in .nvmrc)                  |

## Tailwind 4 Notes

- **No `tailwind.config.mjs`** — all config lives in `src/styles/base.css`
- Uses `@import "tailwindcss"` + `@import "@catppuccin/tailwindcss/mocha.css"` + `@plugin "@tailwindcss/typography"`
- Theme defined via `@theme {}` block (fonts, font-sizes, breakpoints, custom colors)
- Scoped `<style>` blocks in `.astro` files need `@reference "@styles/base.css"` to access utilities
- Prose color overrides (`--tw-prose-*` variables) must be outside `@layer base` to win over plugin cascade

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
│   ├── content/         # Content collections (posts/, projects/, stuff/)
│   │   └── config.ts    # Zod schemas + glob() loaders
│   ├── layouts/
│   │   ├── BaseLayout.astro    # Root layout (head, analytics, ClientRouter)
│   │   ├── PostLayout.astro    # Posts/projects/stuff (TOC + content)
│   │   ├── AboutLayout.astro   # About page (two-column with TOC)
│   │   └── ContactLayout.astro # Contact page (single-column)
│   ├── pages/           # File-based routing
│   ├── styles/          # base.css (Tailwind directives + theme)
│   ├── utils/           # Utility functions (buildTOC)
│   ├── config.ts        # Site metadata, nav menu, socials
│   └── types.ts         # TypeScript type definitions
├── astro.config.mjs
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
- Size discipline: >10 files or >100 lines → ask if splittable
- Lock file changes bundled with package.json are acceptable

### Special commit types

- Changes to `.claude/*` or `CLAUDE.md`: use type `claude` with appropriate scope
  - e.g. `claude(rules): add coding style guide`
  - e.g. `claude(memory): update project overview`
  - e.g. `claude(config): update CLAUDE.md`

## Restrictions

- **Never use `gh` CLI** in this repository (no `gh pr`, `gh api`, etc.)
- Use `git push` directly; PRs via GitHub web UI if needed

## Style

- Dark-only (no light mode)
- Color theme: Catppuccin Mocha
- Fonts: Computer Modern (body), Victor Mono Nerd Font (code)
- Academic/technical aesthetic — keep it minimal
