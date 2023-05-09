import React, { FC, ReactNode } from "react";
import { Title, TypographyStylesProvider } from "@mantine/core";
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

export const ApiDocs: FC<ApiDocsProps> = ({ data }) => {
  return (
    <TypographyStylesProvider>
      <Section
        title="Tree State"
        documentName={data.mdx?.frontmatter?.api?.state}
      />
      <Section
        title="Tree Configuration"
        documentName={data.mdx?.frontmatter?.api?.config}
      />
      <Section
        title="Tree Instance"
        documentName={data.mdx?.frontmatter?.api?.treeInstance}
      />
      <Section
        title="Item Instance"
        documentName={data.mdx?.frontmatter?.api?.itemInstance}
      />
    </TypographyStylesProvider>
  );
};
