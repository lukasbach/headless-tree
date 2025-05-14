import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";
import { storybookPlugin } from "./storybook-plugin";

const config: Config = {
  title: "Headless Tree",
  tagline: "The definitive tree component for the Web",
  favicon: "img/favicon.ico",

  url: "https://headless-tree.lukasbach.com",
  baseUrl: "/",
  organizationName: "lukasbach",
  projectName: "headless-tree",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "docusaurus-plugin-typedoc-api",
      {
        projectRoot: path.join(__dirname, "../.."),
        packages: [
          { path: "packages/core", entry: { index: "src/mddocs-entry.ts" } },
          { path: "packages/react", entry: { index: "src/index.ts" } },
        ],
      },
    ],
    [
      storybookPlugin,
      {
        sbBaseFolder: "../sb-react",
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarCollapsible: false,
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/lukasbach/headless-tree/tree/main/packages/docs/",
        },
        blog: false /* {
          showReadingTime: true,
          editUrl:
            "https://github.com/lukasbach/headless-tree/tree/main/packages/docs/",
        } */,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/banner-1.png",
    navbar: {
      logo: {
        alt: "Site Logo",
        src: "img/logo.svg",
        srcDark: "img/logo.svg",
        href: "/",
        target: "_self",
        width: 32,
        height: 32,
      },
      title: "Headless Tree",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          to: "api",
          label: "API",
          position: "left",
        },
        {
          href: "https://headless-tree.lukasbach.com/storybook/react/",
          label: "Storybook",
          position: "left",
        },
        {
          href: "https://github.com/sponsors/lukasbach",
          label: "Support Headless Tree",
          position: "right",
        },
        {
          href: "https://github.com/lukasbach/headless-tree",
          "aria-label": "GitHub",
          className: "header-icon github",
          position: "right",
        },
        {
          href: "https://bsky.app/profile/lukasbach.bsky.social",
          "aria-label": "Bluesky",
          className: "header-icon bluesky",
          position: "right",
        },
        {
          href: "https://discord.gg/KuZ6EezzVw",
          "aria-label": "Discord",
          className: "header-icon discord",
          position: "right",
        },
      ],
    },
    footer: {
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Get Started",
              to: "/getstarted",
            },
            {
              label: "API",
              to: "/api",
            },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "Github",
              href: "https://github.com/lukasbach/headless-tree",
            },
          ],
        },
        {
          title: "More from me",
          items: [
            {
              label: "My GitHub profile",
              href: "https://github.com/lukasbach",
            },
            {
              label: "My personal homepage",
              href: "https://lukasbach.com",
            },
            {
              label: "Yana",
              href: "https://yana.js.org",
            },
            {
              label: "DevSession",
              href: "https://devsession.js.org",
            },
            {
              label: "Orion",
              href: "https://orion.lukasbach.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://lukasbach.com" target="_blank">Lukas Bach</a>. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    algolia: {
      appId: "FFLV3J7KTK",
      apiKey: "2b97360259a47c5b8dd45c0f02332285",
      indexName: "headless-tree-lukasbach",
      searchPagePath: "search",
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
