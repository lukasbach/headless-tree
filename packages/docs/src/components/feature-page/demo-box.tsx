import React, { FC, useState } from "react";
import { Box, Button, Select } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useStories } from "@/queries/use-stories";

export type DemoBoxProps = {
  storybookTag?: string | null;
  height: string;
};

const storyStartToken = "// story-start";

export const DemoBox: FC<DemoBoxProps> = ({ storybookTag, height }) => {
  const { allStory } = useStories();
  const stories = allStory.nodes.filter((story) =>
    storybookTag ? story.tags?.includes(storybookTag) : true
  );
  const [selectedStory, setSelectedStory] = useState(stories[0].story);
  const story = stories.find((s) => s.story === selectedStory)!;
  const code = story.source?.includes(storyStartToken)
    ? story.source.split(storyStartToken)[1]
    : story.source;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height,
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          padding: "4px 8px",
        })}
      >
        <Box>Example:</Box>
        <Select
          size="xs"
          sx={{ width: "200px", paddingLeft: "8px" }}
          value={selectedStory}
          onChange={setSelectedStory}
          data={stories.map((story) => ({
            value: story.story ?? "",
            label: story.name ?? "",
          }))}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button size="xs" variant="default" mr="sm">
          Open Source
        </Button>
        <Button size="xs" variant="default">
          Open in Storybook
        </Button>
      </Box>
      <Box
        display="flex"
        sx={(theme) => ({
          flexGrow: 1,
          minHeight: 0,
          alignItems: "stretch",
          borderBottom: "1px solid",
          borderColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
        })}
      >
        <Box w="50%" h="100%">
          <Box p="16px" h="100%">
            <Box
              component="iframe"
              src={story.embed ?? ""}
              width="100%"
              height="100%"
              sx={{ borderRadius: 16, border: "none", background: "white" }}
            />
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }} h="100%">
          <Prism
            withLineNumbers
            language="tsx"
            children={code ?? "Could not load source"}
          />
        </Box>
      </Box>
    </Box>
  );
};
