import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
    title: z.string(),
    // aim for ~150-160 chars: this is roughly where google truncates search snippets
    description: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    draft: z.boolean(),
    activeNav: z.enum(["~", "about", "projects", "posts", "contact"]),
    shortTitle: z.string().optional(),
    // hidden seo metadata (article:tag / json-ld keywords) - not a visible tag/browse feature
    seo_keywords: z.array(z.string()).optional(),
    headings: z
        .array(
            z.object({
                depth: z.number(),
                slug: z.string(),
                text: z.string(),
            }),
        )
        .optional(),
    ai_use: z.array(z.enum(["gpt", "claude", "gemini", "grok", "qwen", "deepseek"])).optional(),
    github: z.string().optional(),
});

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
    schema: baseSchema,
});

const projectsCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: baseSchema
});

export const collections = {
    posts: postsCollection,
    projects: projectsCollection,
};
