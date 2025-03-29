/* eslint-disable react/no-array-index-key */
import { FC, useEffect, useMemo, useState } from "react";
import { useStories } from "@site/src/util/use-stories";
import { useStoriesByTags } from "@site/src/util/use-stories-by-tags";
import { Highlight } from "prism-react-renderer";
import { useCleanedCode } from "@site/src/components/demo/use-cleaned-code";
import { useAllStories } from "@site/src/util/use-all-stories";
import styles from "./demo-box.module.css";

export type DemoBoxProps = {
  stories?: string[] | null;
  tags?: string[];
  initialStory?: string;
  height?: string;
  fullWidth?: boolean;
  all?: boolean;
};

export const storybookRoot =
  process.env.NODE_ENV === "production"
    ? "https://headless-tree.lukasbach.com/storybook/react"
    : "http://localhost:6006";

export const DemoBox: FC<DemoBoxProps> = ({
  stories,
  tags,
  all,
  initialStory,
  height,
}) => {
  const tagStories = useStoriesByTags(tags);
  const idStories = useStories(stories);
  const allStories = useAllStories(!all);
  const storyData = useMemo(
    () => [...(tagStories ?? []), ...(idStories ?? []), ...(allStories ?? [])],
    [idStories, tagStories, allStories],
  );
  const [selectedStory, setSelectedStory] = useState(-1);

  const story = useMemo(
    () => storyData?.[selectedStory] ?? null,
    [selectedStory, storyData],
  );

  useEffect(() => {
    if (!storyData) return;

    if (initialStory) {
      const initialIndex = storyData.findIndex((s) => s.id === initialStory);
      if (initialIndex >= 0) {
        setSelectedStory(initialIndex);
      }
    } else {
      setSelectedStory(0);
    }
  }, [storyData, initialStory]);

  const code = useCleanedCode(story?.code ?? "");

  if (!story) return null;

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          Demo:
          <select
            className={styles.storySelector}
            value={selectedStory}
            onChange={(event) =>
              setSelectedStory(parseInt(event.target.value, 10))
            }
          >
            {storyData.map((story, index) => (
              <option key={story.id} value={index}>
                {story.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.topRight}>
          <a
            href={`https://github.com/lukasbach/headless-tree/tree/main/packages/sb-react/${story.importPath}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Full Code
          </a>
          <a
            href={`https://headless-tree.lukasbach.com/storybook/react/index.html?path=/story/${story.id}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Storybook
          </a>
        </div>
      </div>
      <div className={styles.sidebyside} style={{ height }}>
        <div className={styles.left}>
          <iframe
            title="Demo"
            src={`${storybookRoot}/iframe.html?path=/story/${story.id}`}
            width="100%"
            height="100%"
          />
        </div>
        <div className={styles.right}>
          <Highlight code={code} language="tsx">
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>
    </div>
  );
};
