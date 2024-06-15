import { useEffect, useMemo, useState } from "react";
import { useStories } from "@site/src/util/use-stories";

export const useStoriesByTags = (tags?: string[]) => {
  const [tagData, setTagData] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      setTagData(
        (
          await import(
            `@generated/docusaurus-plugin-storybook/default/story-tags.json` as any
          )
        ).default,
      );
    })();
  }, []);

  const stories = useMemo(
    () =>
      tagData
        ? tags
            ?.map((tag) => tagData[tag])
            .reduce((acc, val) => (val ? [...acc, ...val] : acc), [])
        : [],
    [tagData, tags],
  );

  return useStories(stories);
};
