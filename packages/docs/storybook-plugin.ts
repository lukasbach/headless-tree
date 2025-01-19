import type { Plugin, PluginModule } from "@docusaurus/types/src/plugin";
import * as fs from "fs/promises";
import * as path from "path";
import { StoryData } from "@site/src/util/use-stories";

type Options = {
  sbBaseFolder?: string;
  storiesJsonPath?: string;
};

type Content = Record<string, StoryData>;

const defaultOptions: Options = {
  sbBaseFolder: "./",
  storiesJsonPath: "storybook-static/index.json",
};

export const storybookPlugin: PluginModule = (
  context,
  options: Options,
): Plugin<Content> => {
  const { sbBaseFolder, storiesJsonPath } = { ...defaultOptions, ...options };
  return {
    name: "docusaurus-plugin-storybook",
    loadContent: async () => {
      const { entries } = JSON.parse(
        await fs.readFile(path.join(sbBaseFolder, storiesJsonPath), {
          encoding: "utf-8",
        }),
      );
      const withCode = await Promise.all(
        Object.entries(entries).map(async ([id, story]: any) => ({
          id,
          title: story.title,
          name: story.kind,
          importPath: story.importPath,
          tags: story.tags,
          code: await fs.readFile(path.join(sbBaseFolder, story.importPath), {
            encoding: "utf-8",
          }),
        })),
      );
      return withCode.reduce(
        (acc, story) => ({
          ...acc,
          [story.id]: story,
        }),
        {},
      );
    },
    contentLoaded: async ({ content, actions }) => {
      const storiesByTags = Object.values(content).reduce((acc, story) => {
        story.tags.forEach((tag: string) => {
          acc[tag] ??= [];
          acc[tag].push(story.id);
        });
        return acc;
      }, {});
      await actions.createData(
        "story-tags.json",
        JSON.stringify(storiesByTags),
      );

      const allStories = Object.values(content).map((story) => story.id);
      await actions.createData("all-stories.json", JSON.stringify(allStories));

      for (const [id, story] of Object.entries(content)) {
        await actions.createData(`story.${id}.json`, JSON.stringify(story));
      }
    },
  };
};
