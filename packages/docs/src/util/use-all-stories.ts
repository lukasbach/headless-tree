import { useEffect, useState } from "react";
import { useStories } from "@site/src/util/use-stories";

export const useAllStories = (skip?: boolean) => {
  const [storyList, setStoryList] = useState<string[] | null>(null);

  useEffect(() => {
    if (skip) return;
    (async () => {
      setStoryList(
        (
          await import(
            `@generated/docusaurus-plugin-storybook/default/all-stories.json` as any
          )
        ).default,
      );
    })();
  }, [skip]);

  return useStories(storyList);
};
