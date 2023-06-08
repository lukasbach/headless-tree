import React, { FC, ReactNode } from "react";
import { Box, Title, Text, Tabs, Container, createStyles } from "@mantine/core";
import { MDXProvider } from "@mdx-js/react";
import {
  IoDiceOutline,
  IoDocumentTextOutline,
  IoFlaskOutline,
} from "react-icons/io5";
import { Prism } from "@mantine/prism";
import { DemoBox } from "./demo-box";
import { ApiDocs } from "./api-docs";
import { PageMetaLink } from "@/components/page/page-meta-link";
import { TocItems } from "@/components/toc-items";

export type PageContainerProps = {
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

export const PageContainer: FC<PageContainerProps> = ({ children, data }) => {
  const tabStyles = useTabStyles();
  const hasDemos = !!data?.mdx?.frontmatter?.storybook;
  const hasApi = !!data?.mdx?.frontmatter?.api;

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
          {data.mdx?.frontmatter?.metalinks?.map(
            (link) =>
              link && (
                <PageMetaLink
                  label={link.name ?? ""}
                  href={link.href}
                  linkText={link.label ?? undefined}
                  value={
                    link.code && (
                      <Prism
                        language={(link.language ?? "typescript") as any}
                        children={link.code ?? ""}
                        noCopy
                        w="400px"
                        ml="-16px"
                        sx={{ " pre": { padding: 0 } }}
                      />
                    )
                  }
                />
              )
          )}
          <Tabs.List
            mt="sm"
            display={!hasDemos && !hasApi ? "none" : undefined}
          >
            <Tabs.Tab value="page" icon={<IoDocumentTextOutline />}>
              Guide
            </Tabs.Tab>

            {hasDemos && (
              <Tabs.Tab value="demo" icon={<IoDiceOutline />}>
                Demos
              </Tabs.Tab>
            )}

            {hasApi && (
              <Tabs.Tab value="api" icon={<IoFlaskOutline />}>
                API
              </Tabs.Tab>
            )}
          </Tabs.List>
        </Container>
      </Box>

      <Tabs.Panel value="page" pt="xs">
        <Box sx={{ display: "flex" }}>
          <Container sx={{ flexGrow: 1, width: 0 }}>
            <MDXProvider
              components={{
                code: ({ children, className }) => (
                  <Prism
                    children={children as string}
                    language={(className?.slice(9) ?? "typescript") as any}
                  />
                ),
              }}
            >
              {children}
            </MDXProvider>
          </Container>
          <Box sx={{ width: "var(--toc-width)" }}>
            <Box
              sx={{
                position: "sticky",
                top: "var(--header-height)",
                maxHeight: "calc(100vh - var(--header-height))",
                overflow: "auto",
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

      {hasDemos && (
        <Tabs.Panel value="demo" pt="xs">
          <DemoBox
            stories={[data.mdx?.frontmatter?.storybook]}
            height="calc(100vh - var(--header-height))"
            fullWidth={true}
            initialStory="basic"
          />
        </Tabs.Panel>
      )}

      {hasApi && (
        <Tabs.Panel value="api" pt="xs">
          <Container>
            <ApiDocs data={data} />
          </Container>
        </Tabs.Panel>
      )}
    </Tabs>
  );
};
