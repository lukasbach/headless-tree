import { useStories } from "@site/src/util/use-stories";
import { useMemo } from "react";

export const useStory = (storyId: string) =>
  useStories(useMemo(() => [storyId], [storyId]))?.[0] ?? null;
