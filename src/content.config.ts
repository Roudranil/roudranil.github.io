import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    draft: z.boolean(),
    activeNav: z.enum([
        "~",
        "about",
        "stuff",
        "projects",
        "posts",
        "contact",
    ]),
    shortTitle: z.string().optional(),
    headings: z
        .array(
            z.object({
                depth: z.number(),
                slug: z.string(),
                text: z.string(),
            }),
        )
        .optional(),
});

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
    schema: baseSchema,
});

const projectsCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: baseSchema.extend({
        github: z.string().optional(),
    }),
});

const stuffCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/stuff" }),
    schema: baseSchema,
});

export const collections = {
    posts: postsCollection,
    projects: projectsCollection,
    stuff: stuffCollection,
};
