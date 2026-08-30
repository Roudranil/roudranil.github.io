export interface TOCHeading {
    depth: number;
    slug: string;
    text: string;
}

export interface TOCNode extends TOCHeading {
    subheadings: TOCNode[];
    /** Ancestor continuation prefix ("│   " / "    " segments), drawn before `connector`. */
    prefix: string;
    /** This node's own tree-branch glyph: "├── " for a non-last sibling, "└── " for the last. */
    connector: string;
}

/**
 * Builds a table-of-contents tree from a flat list of headings, and decorates
 * every node with the tree(1)-command-style prefix/connector strings needed
 * to render an authentic ASCII tree at arbitrary depth.
 *
 * Markdown bodies are assumed to start at h2 — h1 is reserved for the
 * layout-injected page title (see docs/quirks.md). Headings deeper than
 * h4 are dropped — the ToC only tracks depth up to h4.
 */
export function buildTOC(headings: TOCHeading[]): TOCNode[] {
    if (!headings || headings.length === 0) return [];

    const toc: TOCNode[] = [];
    const parentHeadings = new Map<number, TOCNode>();

    headings
        .filter((h) => h.depth <= 4)
        .forEach((h) => {
            const heading: TOCNode = { ...h, subheadings: [], prefix: "", connector: "" };
            parentHeadings.set(heading.depth, heading);
            // Change 2 to 1 if your markdown includes your <h1>
            if (heading.depth === 2) {
                toc.push(heading);
            } else {
                parentHeadings.get(heading.depth - 1)?.subheadings.push(heading);
            }
        });

    assignTreePrefixes(toc, "");
    return toc;
}

/**
 * Walks the already-nested tree and assigns each node's own connector plus
 * the continuation prefix its children should inherit. Needs the full
 * sibling array up front to know which node is last, which is why this is a
 * second pass rather than folded into the flat-to-nested walk above.
 */
function assignTreePrefixes(nodes: TOCNode[], ancestorPrefix: string): void {
    nodes.forEach((node, index) => {
        const isLastSibling = index === nodes.length - 1;
        node.prefix = ancestorPrefix;
        node.connector = isLastSibling ? "└─" : "├─";
        assignTreePrefixes(node.subheadings, ancestorPrefix + (isLastSibling ? "    " : "│   "));
    });
}
