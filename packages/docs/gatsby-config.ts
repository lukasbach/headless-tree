import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  // Since `gatsby-plugin-typescript` is automatically included in Gatsby you
  // don't need to define it here (just if you need to change the options)
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/apidocs`,
      },
    },
    `gatsby-transformer-remark`,
  ],
  jsxRuntime: `automatic`,
};

export default config;
