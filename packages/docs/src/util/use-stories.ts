import { useEffect, useState } from "react";

export type StoryData = {
  id: string;
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  code: string;
};

export const useStories = (storyIds: string[] | undefined) => {
  const [data, setData] = useState<StoryData[] | null>(null);
  useEffect(() => {
    const storyPromises = storyIds?.map(async (storyId) => {
      const story = await import(
        `@generated/docusaurus-plugin-storybook/default/story.${storyId}.json`
      );
      return story.default as StoryData;
    });
    Promise.all(storyPromises ?? []).then((stories) => setData(stories));
  }, [storyIds]);
  return data;
};
