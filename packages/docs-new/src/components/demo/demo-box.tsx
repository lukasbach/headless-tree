import { FC, useMemo, useState } from "react";
import { useStories } from "@site/src/util/use-stories";
import { useStoriesByTags } from "@site/src/util/use-stories-by-tags";
import { Highlight } from "prism-react-renderer";
import styles from "./demo-box.module.css";

export type DemoBoxProps = {
  stories?: string[] | null;
  tags?: string[];
  initialStory?: string;
  height?: string;
  fullWidth?: boolean;
};

export const DemoBox: FC<DemoBoxProps> = ({ stories, initialStory, tags }) => {
  const tagStories = useStoriesByTags(tags);
  const idStories = useStories(stories);
  const storyData = useMemo(
    () => [...(tagStories ?? []), ...(idStories ?? [])],
    [idStories, tagStories],
  );
  const [selectedStory, setSelectedStory] = useState(0);

  const story = useMemo(
    () => storyData?.[selectedStory] ?? null,
    [selectedStory, storyData],
  );

  if (!story) return null;

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          Demo:
          <select
            className={styles.storySelector}
            value={selectedStory}
            onChange={(event) => setSelectedStory(parseInt(event.target.value))}
          >
            {storyData.map((story, index) => (
              <option key={story.id} value={index}>
                {story.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.topRight}>
          <a href="#">Code</a>
          <a href="#">Storybook</a>
        </div>
      </div>
      <div className={styles.sidebyside}>
        <div className={styles.left}>
          <iframe
            title="Demo"
            src={`https://headless-tree.lukasbach.com/storybook/react/iframe.html?path=/story/${story.id}`}
            width="100%"
            height="100%"
          />
        </div>
        <div className={styles.right}>
          <Highlight code={story.code} language="tsx">
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
