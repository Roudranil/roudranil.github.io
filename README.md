# roudranil.github.io

<div style="display: flex; justify-content: center; align-items: center; ">
  <img src="public/icon.svg" alt="site icon" style="width: 200px; " />
</div>

Personal portfolio site for Roudranil Das. Built with Astro 6, Tailwind CSS 4, and deployed to GitHub Pages.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm

## Setup

```bash
# clone and install
git clone git@github.com:roudranil/roudranil.github.io.git
cd roudranil.github.io
npm install
```

## Development

```bash
# start dev server at http://localhost:4321
npm run dev

# type-check + build for production
npm run build

# preview production build locally
npm run preview
```

## Project Structure

```
src/
  content/          # markdown/mdx content collections
    posts/          # blog posts
    projects/       # portfolio projects
    stuff/          # miscellaneous entries
  content.config.ts # collection schemas + loaders
  components/       # reusable astro components
  layouts/          # page layouts (Base, Post, About, Contact)
  pages/            # file-based routing
  styles/           # tailwind v4 base.css + theme
  config.ts         # site metadata, nav, socials
  utils/            # utilities (TOC builder)
public/
  fonts/            # self-hosted Computer Modern + Victor Mono
  styles/           # static CSS (KaTeX overrides, etc.)
```

## Stack

| Layer       | Technology                                         |
| ----------- | -------------------------------------------------- |
| Framework   | Astro 6                                            |
| Styling     | Tailwind CSS 4 + @catppuccin/tailwindcss (mocha)   |
| Typography  | @tailwindcss/typography                            |
| Math        | remark-math + rehype-katex                         |
| Syntax      | Shiki (catppuccin-mocha theme, built-in)           |
| Analytics   | Google Analytics via @astrojs/partytown            |
| Deployment  | GitHub Pages via GitHub Actions                    |
| Node        | 22+                                                |

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start dev server                     |
| `npm run build`    | Type-check + production build        |
| `npm run preview`  | Preview production build             |
| `npm run sync-resume` | Sync resume PDF from external source |
| `npm run create`   | Scaffold new content entry           |

## Adding Content

Use the create script or manually add a `.md`/`.mdx` file to the appropriate `src/content/` subdirectory. Frontmatter schema:

```yaml
---
title: "Post Title"
description: "Optional description"
date: 2024-01-15
draft: false
activeNav: "posts"        # ~, about, stuff, projects, posts, contact
shortTitle: "Short"       # optional breadcrumb override
github: "https://..."     # projects only
---
```

## Deployment

Deploys automatically on push to `main` via `.github/workflows/deploy.yml`. Uses `withastro/action@v6` with Node 22.

## Known Quirks

- `VictorMonoNerdFont` is slightly larger than other fonts — links are set to 17px to compensate
- 5 moderate npm audit vulnerabilities remain (all in dev-only transitive deps via `@astrojs/language-server` → `volar-service-yaml`)

## Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/). See the `git-commit` skill in `.claude/skills/` for full rules.

```
<type>(<scope>): <subject>
```

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or behavior                                 |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, whitespace — no logic change                |
| `build`    | Build system or dependency changes                      |
| `ci`       | CI configuration                                        |
| `chore`    | Tooling, config — no production code change             |
