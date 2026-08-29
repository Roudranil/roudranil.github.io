# Aesthetic

The site is styled as if you are looking at a terminal session and a
rendered LaTeX document at the same time. Every chrome element (header,
nav, breadcrumbs, table of contents) plays a filesystem/shell metaphor.
Post *content* plays an academic-typesetting metaphor. These are two
deliberate, coexisting design languages — not competing ones.

## Terminal chrome

- Header branding is bash-prompt styled (`[rudy ~]$`, `Header.astro`) — see
  `docs/quirks.md` for the "rudy" site-title note.
- Nav labels are shell paths (`~/posts`, `~/about`) from `MENU` in
  `src/config.ts`. The active-item matching logic in `Header.astro` and the
  label strings must stay in sync by convention — see `docs/quirks.md`.
- Breadcrumbs (`Breadcrumbs.astro`) render as a filesystem path (`~ / post-slug`).

## Table of Contents as `tree` output

The left-rail ToC on post/about pages must look like the literal stdout of
running `tree` on the post's heading structure — not just "a nested list
with some icons."

`buildTOC` (`src/utils/utils.ts`) does this in two passes: nest the flat
heading list by depth, then walk the nested tree assigning each node a
`connector` (`├── ` for a non-last sibling, `└── ` for the last) and a
`prefix` (the ancestor continuation string, `│   ` or `    ` per ancestor
level). `TableOfContentsHeading.astro` renders `prefix + connector` as a
literal `aria-hidden`, `white-space: pre`, monospace span before each
heading link.

**Don't reintroduce CSS-only tree glyphs.** An earlier version drew the
glyphs via `::before`/`:last-child` CSS selectors. That approach can only
special-case a fixed number of nesting levels (it hardcoded `li` and `li li`
rules for h2/h3) and cannot express "is this an ancestor's continuation
column" at all — `│` requires knowing whether an *ancestor*, not the node
itself, was a last sibling. That's tree-shaped information a flat CSS
selector can't see. The glyphs must be computed once per node in
`buildTOC` and rendered as content, not drawn from a CSS pseudo-element.

Monospace is required on the glyph span — box-drawing characters only
align into a real tree shape in a fixed-width face.

## LaTeX-document post typography

Post body content (inside `.prose`) uses self-hosted Computer Modern fonts
and KaTeX math rendering — see `docs/styling.md`'s Fonts section for the
`@font-face` details, not duplicated here.

The ToC's `.prose` wrapper was removed as part of the tree-rendering
overhaul: it was there only to borrow a couple of typographic declarations,
but `.prose` carries a large, unrelated cascade with it (see
`docs/styling.md`'s prose-overrides quirk) — including a `.prose li`
top-margin meant for post-body lists, which leaked into the ToC and caused
a visible gap between every row. Chrome components should copy the one or
two declarations they actually need instead of opting into `.prose`.

## Aesthetic contract — don't break these

- Don't reintroduce CSS `::before`/`:last-child`-only tree glyphs. Arbitrary
  heading depth needs content-based rendering — see `buildTOC` above.
- Don't wrap a non-prose chrome component in `.prose` just to borrow one or
  two typographic declarations — copy the specific declaration instead.
- Keep nav label strings (`src/config.ts`) and `Header.astro`'s active-item
  matching logic in sync (see `docs/quirks.md`).
- New heading levels (h4+) in post content must render correctly in the ToC
  without new component code. If a new depth needs special-casing, something
  regressed.
