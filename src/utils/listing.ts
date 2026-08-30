import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";
import { getLastEditedDate } from "@utils/git";
import { stripInlineMarkdown } from "@utils/inlineMarkdown";

// nerd-font glyph. \uXXXX escape ONLY — a pasted PUA glyph silently
// vanished on a prior write with no error (docs/quirks.md). This is a
// placeholder codepoint: swap for the real one when given.
/** GitHub mark shown beside each entry's date line. */
export const GITHUB_ICON = ""; // nf-fa-github (placeholder)

export interface ListRow {
    url: string;
    title: string;
    plainTitle: string;
    subtitle: string | null;
    created: Date;
    modified: Date | null;
    gitUrl: string | null;
}

export interface YearGroup {
    year: number;
    rows: ListRow[];
}

type ListableEntry = CollectionEntry<"posts"> | CollectionEntry<"projects">;

/**
 * Builds the sorted rows a `ContentListing` renders for one collection.
 *
 * `basePath` is the route prefix (`/posts`, `/projects`) used to build each
 * row's page URL. Rows come back sorted newest-created first so the no-JS
 * render already matches the listing's default grouping.
 */
export function buildListRows(entries: ListableEntry[], basePath: string): ListRow[] {
    const gitHash = import.meta.env.PUBLIC_GIT_HASH;

    const rows = entries.map((entry) => {
        const modified = entry.filePath ? getLastEditedDate(entry.filePath) : null;
        const gitUrl =
            gitHash && entry.filePath ? `${SITE.repo}/blob/${gitHash}/${entry.filePath}` : null;

        return {
            url: `${basePath}/${entry.id}`,
            title: entry.data.title,
            plainTitle: stripInlineMarkdown(entry.data.title),
            subtitle: entry.data.subtitle ?? null,
            created: new Date(entry.data.date),
            modified,
            gitUrl,
        };
    });

    return rows.sort((a, b) => b.created.valueOf() - a.created.valueOf());
}

/**
 * Derives an `owner/repo` label from a GitHub URL, for display next to the
 * git glyph. Falls back to `"Github"` if the URL doesn't have two path
 * segments. Mirrors `GithubLink.astro`'s `getRepoLabel`.
 */
export function getRepoLabel(url: string): string {
    try {
        const segments = new URL(url).pathname.split("/").filter(Boolean);
        return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : "Github";
    } catch {
        return "Github";
    }
}

/**
 * Groups already-sorted rows by their creation year, newest year first.
 * Rows within a group keep the order they arrived in.
 */
export function groupRowsByYear(rows: ListRow[]): YearGroup[] {
    const groups: YearGroup[] = [];

    for (const row of rows) {
        const year = row.created.getFullYear();
        const current = groups.at(-1);
        if (current && current.year === year) {
            current.rows.push(row);
        } else {
            groups.push({ year, rows: [row] });
        }
    }

    return groups;
}
