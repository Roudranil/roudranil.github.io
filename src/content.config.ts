import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { baseSchema } from "./schemas/contentSchema";

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
