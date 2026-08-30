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

`buildTOC` (`src/utils/toc.ts`) nests the flat heading list by depth, then
walks the nested tree assigning each node a `prefix` (the ancestor
continuation string — `│   ` per ancestor level, or `BLANK` ("    ") below a
last sibling), a `connector` (`BRANCH` = `├── ` for a non-last sibling,
`LAST` = `└── ` for the last), and a `childPrefix` its own subheadings
inherit as their ancestor prefix. This is ordinary `tree(1)` last-sibling
logic, computed over real headings only. Every level (`TocLevel.astro`,
recursive via `<Astro.self>`) renders its sibling list followed by a
trailing Expand/Collapse toggle row — see "Collapsing a level" below. The
toggle keeps that level's indentation (it renders at `prefix`, the same
ancestor prefix its siblings share) but is **not** a tree sibling: it
doesn't factor into which heading gets `LAST`, and its own connector
position renders `BLANK` instead of a glyph — connected only by the real
`│` ancestor columns running past it, no visible branch of its own.
`TocLevel.astro` renders `node.prefix + node.connector` (headings) /
`prefix + BLANK` (toggle) as a literal `aria-hidden`, `white-space: pre`,
monospace span before each row.

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

### Wrapping long headings

A heading longer than the remaining row width (`W` minus the gutter) must
still read as a tree, not fall back to flush-left wrapping. `.toc-gutter`
holds two spans: `.toc-glyph` (in flow, one line — this is what gives the
row its height) and `.toc-cont` (`WRAP_CONTINUATION_LINES` (8) repeats of
`prefix + PIPE`, absolutely positioned at `top: 1lh` so it never adds to
that height itself). The text column wraps normally; `overflow: hidden`
on the gutter clips `.toc-cont` down to however many wrapped lines the
text actually produced, so the `│` ancestor columns run unbroken behind
the wrap and vanish entirely for a one-line heading. This stays
content-based per the rule above — the continuation string is still
computed in `toc.ts`, CSS only clips it. See `docs/quirks.md` for why
`.toc-cont` must be out-of-flow (it wasn't, the first time this was
built, and every row rendered 8 lines tall).

### Collapsing a level

Every level — including the h2 root list — can collapse. Collapsed: the
level renders as a single ` Expand` row, indented to the level's prefix
but with no visible connector (see above). Expanded: the level's rows,
then a ` Collapse` row in that same position. Expanding a level only
reveals its direct children; grandchild levels keep their own independent
collapsed/expanded state. `TocLevel.astro`'s toggle sets
`data-expanded="true"|"false"` on its own `.toc-level`; with no attribute
set, `base.css`'s `sm` (640px) media query decides — expanded above 640px,
collapsed at/below. This CSS default (not a JS-computed one) is what
avoids a flash-of-wrong-state on mobile before the toggle script runs.

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

ToC heading text is deliberately **not** rendered from the raw
`text: string` Astro hands `buildTOC` — that string is markdown/math
source, HTML-escaped if printed as-is. Instead `TableOfContents.astro`'s
inline script (`astro:page-load` handler, not `DOMContentLoaded` — see
`docs/quirks.md` on `ClientRouter`) clones each real heading's
`innerHTML` (minus its `.heading-anchor`) into the matching `.toc-link`
once the page has hydrated. The server-rendered `text` is only the no-JS
fallback, and it still carries the literal `#` and raw markdown/math
source in that fallback — acceptable, since it is JS-hydrated on every
normal load. `TocLevel.astro`'s `.toc-link` and `.toc-gutter` force
`color: var(--color-darker-rosewater)` — the same token
`text-darker-rosewater` gives the "Table of Contents" label itself — in
every state (including inside cloned KaTeX markup), so both the tree
glyphs and the heading text hold that one color regardless of what the
real heading or its math rendered with.

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
- Collapse state must default from CSS (the `sm` media query), never from a
  JS-computed attribute set after mount — the point is no flash of the wrong
  state on mobile before hydration.
- Don't rely on the pre-JS server-rendered ToC text for correctness; it is
  the no-JS fallback only. Markdown/math fidelity comes from the client-side
  heading clone.
