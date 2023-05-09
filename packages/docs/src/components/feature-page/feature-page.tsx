import React, { FC, ReactNode } from "react";
import { Box, Title, Text, Tabs, Container, createStyles } from "@mantine/core";
import {
  IoDiceOutline,
  IoDocumentTextOutline,
  IoFlaskOutline,
} from "react-icons/all";
import { DemoBox } from "./demo-box";
import { ApiDocs } from "./api-docs";

export type FeaturePageProps = {
  children: ReactNode;
  data: Queries.DocByIdQuery;
};

const useTabStyles = createStyles((theme) => ({
  tabsList: {
    border: "none",
    marginBottom: "2px",
  },
}));

export const FeaturePage: FC<FeaturePageProps> = ({ children, data }) => {
  const tabStyles = useTabStyles();
  return (
    <Tabs defaultValue="page" classNames={tabStyles.classes}>
      <Box
        sx={(theme) => ({
          borderBottom: "1px solid",
          borderColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[2],
        })}
      >
        <Container>
          <Title order={1}>{data.mdx?.frontmatter?.title}</Title>
          <Text fz="lg">Subtitle</Text>
          <Tabs.List>
            <Tabs.Tab value="page" icon={<IoDocumentTextOutline />}>
              Guide
            </Tabs.Tab>
            <Tabs.Tab value="demo" icon={<IoDiceOutline />}>
              Demos
            </Tabs.Tab>
            <Tabs.Tab value="api" icon={<IoFlaskOutline />}>
              API
            </Tabs.Tab>
          </Tabs.List>
        </Container>
      </Box>

      <Tabs.Panel value="page" pt="xs">
        <DemoBox data={data} />
        <Container>{children}</Container>
      </Tabs.Panel>

      <Tabs.Panel value="api" pt="xs">
        <Container>
          <ApiDocs data={data} />
        </Container>
      </Tabs.Panel>
    </Tabs>
  );
};
