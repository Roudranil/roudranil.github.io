import { z } from "astro/zod";

// pure zod schema, no astro:content import - so it can be loaded directly by
// node (e.g. scripts/read-schema.ts) without going through astro's vite pipeline
export const baseSchema = z.object({
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
