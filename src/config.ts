import type { Site, MenuItem, SocialObjects } from "types";

export const SITE: Site = {
    website: "https://roudranil.github.io",
    repo: "https://github.com/Roudranil/roudranil.github.io",
    author: "Roudranil Das",
    desc: "Roudranil Das's personal site — posts and projects on machine learning, engineering, and math.",
    title: "rudy",
    lightAndDarkMode: false,
    postPerPage: 5,
};

export const MENU: MenuItem[] = [
    {
        title: "~/about",
        path: "/about",
    },
    {
        title: "~/projects",
        path: "/projects",
    },
    {
        title: "~/posts",
        path: "/posts",
    },
    {
        title: "~/contact",
        path: "/contact",
    },
];

export const SOCIALS: SocialObjects = [
    {
        name: "Mail",
        href: "mailto:dasroudranil@gmail.com",
        linkTitle: `Send me a mail!`,
        active: true,
    },
    {
        name: "Github",
        href: "https://github.com/Roudranil",
        linkTitle: `Me on Github`,
        active: true,
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/roudranil-das/",
        linkTitle: `Connect on LinkedIn?`,
        active: true,
    },
    {
        name: "Kaggle",
        href: "https://www.kaggle.com/roudranildas",
        linkTitle: `Me on Kaggle`,
        active: true,
    },
];
