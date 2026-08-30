// tree(1)-style glyph strings shared by buildTOC and TocLevel.astro.
export const BRANCH = "├── ";
export const LAST = "└── ";
export const PIPE = "│   ";
// same width as BRANCH/LAST/PIPE — used where a glyph or continuation
// column must hold its position without drawing a visible line. The
// trailing Expand/Collapse toggle (TocLevel.astro) is not a tree sibling:
// it keeps the row's indentation but renders BLANK instead of a connector,
// so it doesn't count towards which real heading gets LAST. See
// docs/aesthetic.md.
export const BLANK = "    ";

// how many continuation lines to pre-render in the gutter behind a wrapped
// heading. word-wrapped text can span at most this many visual lines before
// the `│` ancestor columns stop lining up — see docs/aesthetic.md.
export const WRAP_CONTINUATION_LINES = 8;

// nerd font glyphs for the collapse toggle (nf-fa-plus_square /
// nf-fa-minus_square, VictorMonoNerdFont). Written as \uXXXX escapes, never
// pasted literal characters — a pasted PUA glyph silently vanished on a
// prior write here with no error (see docs/quirks.md). Verify with a bare
// `ord()` check after any edit to this file.
export const EXPAND_ICON = "";
export const COLLAPSE_ICON = "";

export interface TOCHeading {
    depth: number;
    slug: string;
    text: string;
}

export interface TOCNode extends TOCHeading {
    subheadings: TOCNode[];
    /** Ancestor continuation prefix ("│   " segments), drawn before this node's own connector. */
    prefix: string;
    /** This node's own tree-branch glyph: BRANCH for a non-last sibling, LAST for the last. */
    connector: string;
    /** Prefix this node's subheadings inherit — `prefix + PIPE`, or `+ BLANK` if this node is the last sibling. */
    childPrefix: string;
}

/**
 * Builds a table-of-contents tree from a flat list of headings.
 *
 * Markdown bodies are assumed to start at h2 — h1 is reserved for the
 * layout-injected page title (see docs/quirks.md). Headings deeper than
 * h4 are dropped — the ToC only tracks depth up to h4.
 *
 * Strips a trailing "#" from heading text — rehype-autolink-headings appends
 * a literal "#" anchor to every heading before Astro's heading collector
 * runs, so the raw heading text (astro.config.mjs) always carries one.
 */
export function buildTOC(headings: TOCHeading[]): TOCNode[] {
    if (!headings || headings.length === 0) return [];

    const toc: TOCNode[] = [];
    const parentHeadings = new Map<number, TOCNode>();

    headings
        .filter((h) => h.depth <= 4)
        .forEach((h) => {
            const heading: TOCNode = {
                ...h,
                text: stripTrailingAnchor(h.text),
                subheadings: [],
                prefix: "",
                connector: "",
                childPrefix: "",
            };
            parentHeadings.set(heading.depth, heading);
            // change 2 to 1 if your markdown includes your <h1>
            if (heading.depth === 2) {
                toc.push(heading);
            } else {
                parentHeadings.get(heading.depth - 1)?.subheadings.push(heading);
            }
        });

    assignTreePrefixes(toc, "");
    return toc;
}

function stripTrailingAnchor(text: string): string {
    return text.replace(/#\s*$/, "").trimEnd();
}

/**
 * Walks the already-nested tree and assigns each node's connector plus the
 * prefix strings for its own continuation and its children. "Last sibling"
 * is computed over real headings only — the trailing toggle row
 * (TocLevel.astro) isn't a tree node and never affects this.
 */
function assignTreePrefixes(nodes: TOCNode[], ancestorPrefix: string): void {
    nodes.forEach((node, index) => {
        const isLastSibling = index === nodes.length - 1;
        node.prefix = ancestorPrefix;
        node.connector = isLastSibling ? LAST : BRANCH;
        node.childPrefix = ancestorPrefix + (isLastSibling ? BLANK : PIPE);
        assignTreePrefixes(node.subheadings, node.childPrefix);
    });
}
