import React, { FC, ReactNode } from "react";
import { Box, Title, Text, Tabs, Container, createStyles } from "@mantine/core";
import {
  IoDiceOutline,
  IoDocumentTextOutline,
  IoFlaskOutline,
} from "react-icons/io5";
import { Prism } from "@mantine/prism";
import { DemoBox } from "./demo-box";
import { ApiDocs } from "./api-docs";
import { FeatureLink } from "@/components/feature-page/feature-link";
import { TocItems } from "@/components/toc-items";

export type FeaturePageProps = {
  children: ReactNode;
  data: Queries.DocByIdQuery;
};

const useTabStyles = createStyles((theme) => ({
  tabsList: {
    border: "none",
    marginBottom: "2px",
  },
  panel: {
    paddingTop: "0px !important",
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
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[0],
          paddingRight: "var(--toc-width)",
          paddingTop: 40,
        })}
      >
        <Container>
          <Title order={1}>{data.mdx?.frontmatter?.title}</Title>
          <Text fz="lg" mb="20px">
            {data.mdx?.frontmatter?.subtitle}
          </Text>
          <FeatureLink
            label="Import"
            value={
              data.mdx?.frontmatter?.import && (
                <Prism
                  language="typescript"
                  children={data.mdx?.frontmatter?.import ?? ""}
                />
              )
            }
          />
          <FeatureLink
            label="Source"
            href={data.mdx?.frontmatter?.sourceImplementation}
            linkText="View source"
          />
          <FeatureLink
            label="Types"
            href={data.mdx?.frontmatter?.sourceTypes}
            linkText="View Types Source"
          />
          <FeatureLink label="TypeDoc" href="#" linkText="View Documentation" />
          <Tabs.List mt="sm">
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
        <Box sx={{ display: "flex" }}>
          <Container sx={{ flexGrow: 1 }}>{children}</Container>
          <Box sx={{ width: "var(--toc-width)" }}>
            <Box
              sx={{
                position: "sticky",
                top: "var(--header-height)",
                "> ul": { border: "none" },
              }}
            >
              <TocItems
                items={(data.mdx?.tableOfContents?.items ?? []) as any}
              />
            </Box>
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="demo" pt="xs">
        <DemoBox
          storybookTag={data.mdx?.frontmatter?.storybook}
          height="calc(100vh - var(--header-height))"
          fullWidth={true}
        />
      </Tabs.Panel>

      <Tabs.Panel value="api" pt="xs">
        <Container>
          <ApiDocs data={data} />
        </Container>
      </Tabs.Panel>
    </Tabs>
  );
};
