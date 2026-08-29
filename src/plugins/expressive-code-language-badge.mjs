import { definePlugin } from "@expressive-code/core";

// nerd font (seti-ui/devicons) codepoints, verified present in the self-hosted
// VictorMonoNerdFont-Regular.ttf cmap — see public/fonts/
const LANGUAGE_ICONS = {
    javascript: "",
    js: "",
    jsx: "",
    typescript: "",
    ts: "",
    tsx: "",
    python: "",
    py: "",
    html: "",
    css: "",
    json: "",
    yaml: "",
    yml: "",
    markdown: "",
    md: "",
    mdx: "",
    bash: "",
    sh: "",
    shell: "",
    astro: "",
    git: "",
    dockerfile: "",
    rust: "",
    rs: "",
    go: "",
    java: "",
    c: "",
    cpp: "",
    ruby: "",
    rb: "",
    php: "",
    sql: "",
    toml: "",
};

const LANGUAGE_LABELS = {
    javascript: "JavaScript",
    js: "JavaScript",
    jsx: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    python: "Python",
    py: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    markdown: "Markdown",
    md: "Markdown",
    mdx: "MDX",
    sh: "Shell",
    bash: "Shell",
    shell: "Shell",
    astro: "Astro",
    rust: "Rust",
    rs: "Rust",
    ruby: "Ruby",
    rb: "Ruby",
    cpp: "C++",
};

const FALLBACK_ICON = "";

function getLanguageLabel(language) {
    return LANGUAGE_LABELS[language] ?? language.toUpperCase();
}

function getLanguageIcon(language) {
    return LANGUAGE_ICONS[language] ?? FALLBACK_ICON;
}

export function pluginLanguageBadge() {
    return definePlugin({
        name: "LanguageBadge",
        hooks: {
            // force every block onto the "code" (tab-bar) frame so no block ever gets
            // the macOS-style terminal dots — the language badge is centered on top
            // of this frame uniformly, regardless of language or filename
            preprocessMetadata: ({ codeBlock }) => {
                codeBlock.props.frame = "code";
            },
            postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                const figure = renderData.blockAst;
                const header = figure.children.find((child) =>
                    child.properties?.className?.includes?.("header"),
                );
                if (!header) return;

                // force the header to always render with its padded background,
                // even for blocks with no filename title
                if (!figure.properties.className.includes("has-title")) {
                    figure.properties.className.push("has-title");
                }

                header.children.push({
                    type: "element",
                    tagName: "span",
                    properties: { className: ["ec-lang-badge"] },
                    children: [
                        {
                            type: "element",
                            tagName: "span",
                            properties: { className: ["ec-lang-icon"] },
                            children: [{ type: "text", value: getLanguageIcon(codeBlock.language) }],
                        },
                        {
                            type: "element",
                            tagName: "span",
                            properties: { className: ["ec-lang-label"] },
                            children: [{ type: "text", value: getLanguageLabel(codeBlock.language) }],
                        },
                    ],
                });
            },
        },
    });
}
