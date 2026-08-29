import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExpressiveCode from "rehype-expressive-code";
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
    compressHTML: true,
    markdown: {
        syntaxHighlight: false,
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, [rehypeExpressiveCode, expressiveCodeConfig]],
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
