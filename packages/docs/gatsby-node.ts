import type { GatsbyNode } from "gatsby";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as fs from "fs-extra";
import * as path from "path";
import * as express from "express";

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};

// https://github.com/gatsbyjs/gatsby/issues/13072#issuecomment-630114464
export const onCreateDevServer: GatsbyNode["onCreateDevServer"] = ({ app }) => {
  app.use(express.static("public"));
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  graphql,
  actions,
  createContentDigest,
  createNodeId,
}) => {
  const { stories } = await fs.readJson(
    "./public/storybook/react/stories.json"
  );

  for (const story of Object.values(stories) as any) {
    const basePath = "packages/sb-react";
    const sourcePath = path.join(basePath, story.importPath);
    const source = await fs.readFile(
      path.join(__dirname, "../..", sourcePath),
      "utf-8"
    );
    actions.createNode({
      ...story,
      sourcePath,
      source,
      // eslint-disable-next-line no-underscore-dangle
      embed: `/storybook/react/iframe.html?id=${story.parameters._xid}&viewMode=story`,
      sbSource: "react",
      id: createNodeId(story.id),
      parent: null,
      children: [],
      internal: {
        type: "Story",
        contentDigest: createContentDigest(story),
        content: JSON.stringify(story),
      },
    });
  }
};
