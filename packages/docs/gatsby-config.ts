import type { GatsbyConfig } from "gatsby";
import * as RehypeSlug from "rehype-slug";
import * as RemarkGfm from "remark-gfm";

// https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/#mdxoptions
const wrapESMPlugin = (name) =>
  function wrapESM(opts) {
    return async (...args) => {
      const mod = await import(name);
      const plugin = mod.default(opts);
      return plugin(...args);
    };
  };

const config: GatsbyConfig = {
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [
            // wrapESMPlugin("rehype-slug"),
            RehypeSlug,
            RemarkGfm,
            // [RehypeAutolinkHeadings, { behavior: `wrap` }],
          ],
        },
      },
    },
    // {
    //   resolve: "gatsby-source-filesystem",
    //   options: {
    //     name: "apidocs",
    //     path: `${__dirname}/apidocs`,
    //   },
    // },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "docs",
        path: `${__dirname}/pages`,
      },
    },
  ],
  // jsxRuntime: "automatic",
};

export default config;
