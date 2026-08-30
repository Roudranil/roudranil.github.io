import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

import { pluginLanguageBadge } from "./src/plugins/expressive-code-language-badge.mjs";
import { getBranchName, getCommitHash } from "./src/utils/git.ts";

const gitHash = getCommitHash();
const gitBranch = getBranchName();

const expressiveCodeConfig = {
    themes: ["catppuccin-mocha"],
    plugins: [pluginLanguageBadge()],
    styleOverrides: {
        borderRadius: "1rem",
        borderWidth: "2px",
        borderColor: "#313244",
        codeFontFamily: "var(--font-mono)",
        uiFontFamily: "var(--font-mono)",
        frames: {
            inlineButtonBorderOpacity: "0",
        },
    },
};

export default defineConfig({
    site: "https://roudranil.github.io",
    trailingSlash: "never",
    compressHTML: true,
    markdown: {
        syntaxHighlight: false,
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [
                rehypeSlug,
                [
                    rehypeAutolinkHeadings,
                    {
                        behavior: "append",
                        test: (element) => element.tagName !== "h1",
                        properties: {
                            className: ["heading-anchor"],
                            ariaLabel: "Link to this heading",
                        },
                        content: { type: "text", value: "#" },
                    },
                ],
                rehypeKatex,
                [rehypeExpressiveCode, expressiveCodeConfig],
                [
                    rehypeExternalLinks,
                    {
                        target: "_blank",
                        rel: ["noopener", "noreferrer"],
                    },
                ],
            ],
        }),
    },
    integrations: [
        mdx(),
        sitemap(),
        partytown({
            config: {
                forward: ["dataLayer.push"],
            },
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
        define: {
            "import.meta.env.PUBLIC_GIT_HASH": JSON.stringify(gitHash ?? ""),
            "import.meta.env.PUBLIC_GIT_BRANCH": JSON.stringify(gitBranch ?? ""),
        },
    },
});
