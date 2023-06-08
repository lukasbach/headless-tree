import type { GatsbyNode } from "gatsby";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as fs from "fs-extra";
import * as path from "path";

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()],
    },
  });
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  graphql,
  actions,
  createContentDigest,
  createNodeId,
}) => {
  const { stories } = await fs.readJson(
    "../sb-react/storybook-static/stories.json"
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
      embed:
        process.env.NODE_ENV === "production"
          ? `/storybook/react/iframe.html?id=${story.id}&viewMode=story`
          : "https://example.org",
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

  const apidocs = await fs.readdir("./apidocs/interfaces");
  for (const file of apidocs) {
    const content = await fs.readFile(
      path.join("./apidocs/interfaces", file),
      "utf-8"
    );
    const data = {
      markdown: content,
      file,
    };
    console.log("APIDOC", createNodeId(file), data);
    actions.createNode({
      ...data,
      id: createNodeId(file),
      parent: null,
      children: [],
      internal: {
        type: "ApiDoc",
        contentDigest: createContentDigest(data),
        content: JSON.stringify(data),
      },
    });
  }
};
