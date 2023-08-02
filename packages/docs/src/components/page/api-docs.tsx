import React, { FC, ReactNode, useEffect, useRef } from "react";
import {
  Box,
  Tabs,
  Title,
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApiDocs } from "@/queries/use-api-docs";

export type ApiDocsProps = {
  data: Queries.DocByIdQuery;
};

const Section: FC<{ title: string; documentName?: string | null }> = ({
  documentName,
  title,
}) => {
  const { allApiDoc } = useApiDocs();
  const markdown = allApiDoc.nodes.find(
    (node) => node.file === documentName
  )?.markdown;

  if (!markdown) {
    return null;
  }

  const modifiedMarkdown = markdown
    .split("\n## Properties")[1]
    // remove "Defined in" section
    ?.replace(/#### Defined in\n\n[^_]+___/g, "")
    ?.replace(/#### Defined in\n\n[^_]+$/g, "")

    // disable links
    ?.replace(/\[([^]]+)]\([^)]+\)/g, "$1");

  return (
    <>
      <Title sx={{ borderBottom: "1px solid", paddingTop: "28px" }}>
        {title}
      </Title>
      <ReactMarkdown children={modifiedMarkdown} remarkPlugins={[remarkGfm]} />
    </>
  );
};

const DocsIframe: FC<{ src: string }> = ({ src }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const theme = useMantineTheme();
  useEffect(() => {
    ref.current?.contentDocument?.documentElement.setAttribute(
      "data-theme",
      theme.colorScheme
    );
  }, [theme]);
  return (
    <Box
      component="iframe"
      ref={ref}
      src={src}
      sx={{
        border: "none",
        width: "100%",
        height: "calc(100vh - var(--header-height))",
      }}
      onLoad={() => {
        ref.current?.contentDocument?.documentElement.setAttribute(
          "data-theme",
          theme.colorScheme
        );
        if (ref.current?.contentDocument) {
          ref.current.contentDocument.body.style.background = "transparent";
        }
        ref.current?.contentDocument
          ?.getElementsByClassName("tsd-page-toolbar")
          .item(0)
          ?.remove();
      }}
    />
  );
};

export const ApiDocs: FC<ApiDocsProps> = ({ data }) => {
  return (
    <TypographyStylesProvider>
      <Tabs defaultValue={data.mdx?.frontmatter?.api?.[0]?.name}>
        <Tabs.List>
          {data.mdx?.frontmatter?.api?.map((api) => (
            <Tabs.Tab key={api?.name} value={api?.name ?? ""}>
              {api?.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {data.mdx?.frontmatter?.api?.map((api) => (
          <Tabs.Panel key={api?.name} value={api?.name ?? ""}>
            <DocsIframe src={api?.docs ?? ""} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </TypographyStylesProvider>
  );
};
