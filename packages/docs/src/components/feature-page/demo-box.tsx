import React, { FC, ReactNode } from "react";
import { Box, Grid } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useStories } from "@/queries/use-stories";

export type DemoBoxProps = {
  data: Queries.DocByIdQuery;
};

const storyStartToken = "// story-start";

export const DemoBox: FC<DemoBoxProps> = ({ data }) => {
  const { allStory } = useStories();
  const stories = allStory.nodes.filter((story) =>
    story.tags?.includes(data.mdx?.frontmatter?.storybook ?? "-")
  );
  const story = stories[0];
  const code = story.source?.includes(storyStartToken)
    ? story.source.split(storyStartToken)[1]
    : story.source;

  return (
    <Grid>
      <Grid.Col lg={6} sm={12} px={24}>
        <Box
          component="iframe"
          src={story.embed ?? ""}
          width="100%"
          height="400px"
          sx={{ borderRadius: 16, border: "none" }}
        />
      </Grid.Col>
      <Grid.Col lg={6} sm={12} p={0}>
        <Prism
          withLineNumbers
          language="tsx"
          children={code ?? "Could not load source"}
          sx={{ maxHeight: "400px", overflow: "auto" }}
        />
      </Grid.Col>
    </Grid>
  );
};
