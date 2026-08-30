import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
    const posts = await getCollection("posts", ({ data }) => !data.draft);

    return rss({
        title: SITE.title,
        description: SITE.desc,
        site: context.site ?? new URL(SITE.website),
        trailingSlash: false,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.date,
            link: `/posts/${post.id}`,
        })),
    });
};
