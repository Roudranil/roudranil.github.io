const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const CODE_PATTERN = /`([^`]+)`/g;
// \0 can't occur in normal text and isn't matched by any INLINE_RULES
// pattern, so it's safe as a placeholder delimiter for extracted code spans.
const CODE_PLACEHOLDER = /\0(\d+)\0/g;

const INLINE_RULES: { pattern: RegExp; tag: string }[] = [
    { pattern: /\*\*([^*]+)\*\*/g, tag: "strong" },
    { pattern: /~~([^~]+)~~/g, tag: "del" },
    { pattern: /\+\+([^+]+)\+\+/g, tag: "u" },
    { pattern: /\*([^*]+)\*/g, tag: "em" },
];

/**
 * Converts a subset of inline markdown syntax to safe HTML.
 *
 * Supports **bold**, *italic*, ~~strikethrough~~, ++underline++, `code`.
 * Code spans are extracted before other rules run so their contents are
 * never reprocessed, then reinserted verbatim. Input is HTML-escaped
 * before any tag is generated, so the output only ever contains the five
 * tags this function emits — no sanitizer needed.
 */
export function renderInlineMarkdown(text: string): string {
    const escaped = escapeHtml(text);
    const codeSpans: string[] = [];
    let result = escaped.replace(CODE_PATTERN, (_match, inner: string) => {
        codeSpans.push(inner);
        return `\0${codeSpans.length - 1}\0`;
    });

    for (const { pattern, tag } of INLINE_RULES) {
        result = result.replace(pattern, `<${tag}>$1</${tag}>`);
    }

    return result.replace(
        CODE_PLACEHOLDER,
        (_match, index: string) => `<code>${codeSpans[Number(index)]}</code>`,
    );
}

/**
 * Strips the same inline markdown syntax supported by renderInlineMarkdown,
 * leaving plain text. Use for contexts that can't render HTML (tab title,
 * meta tags, listing cards).
 */
export function stripInlineMarkdown(text: string): string {
    let result = text.replace(CODE_PATTERN, "$1");
    for (const { pattern } of INLINE_RULES) {
        result = result.replace(pattern, "$1");
    }
    return result;
}
