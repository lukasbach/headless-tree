import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";
import { storybookPlugin } from "./storybook-plugin";

const config: Config = {
  title: "My Site",
  tagline: "Dinosaurs are cool",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

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
          { path: "packages/react", entry: { index: "src/index.tsx" } },
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
          sidebarCollapsible: false,
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "My Site",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
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
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
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
              to: "/docs/getstarted",
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
  } satisfies Preset.ThemeConfig,
};

export default config;
