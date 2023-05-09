import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
      },
    },
    "gatsby-plugin-mantine",
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
  jsxRuntime: "automatic",
};

export default config;
