import { FC, useMemo, useState } from "react";
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

export const DemoBox: FC<DemoBoxProps> = ({
  stories,
  initialStory,
  tags,
  all,
}) => {
  const tagStories = useStoriesByTags(tags);
  const idStories = useStories(stories);
  const allStories = useAllStories(!all);
  const storyData = useMemo(
    () => [...(tagStories ?? []), ...(idStories ?? []), ...(allStories ?? [])],
    [idStories, tagStories],
  );
  const [selectedStory, setSelectedStory] = useState(0);

  const story = useMemo(
    () => storyData?.[selectedStory] ?? null,
    [selectedStory, storyData],
  );

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
          <a
            href={`https://github.com/lukasbach/headless-tree/tree/main/packages/sb-react/${story.importPath}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Code
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
