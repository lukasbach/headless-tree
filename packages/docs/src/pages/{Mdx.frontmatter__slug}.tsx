import React from "react";
import { graphql, PageProps } from "gatsby";
import { LayoutContainer } from "@/components/layout/layout-container";
import { FeaturePage } from "@/components/feature-page/feature-page";

export default function DocPage({
  data,
  location,
  children,
}: PageProps<Queries.DocByIdQuery>) {
  if (data.mdx?.frontmatter?.template === "feature") {
    return (
      <LayoutContainer location={location.pathname}>
        <FeaturePage data={data}>{children}</FeaturePage>
      </LayoutContainer>
    );
  }
  return (
    <LayoutContainer location={location.pathname}>{children}</LayoutContainer>
  );
}

export const Head = () => {
  return null;
};

export const query = graphql`
  query DocById($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        slug
        title
        subtitle
        api {
          config
          hotkeys
          itemInstance
          state
          treeInstance
        }
        import
        storybook
        template
        sourceTypes
        sourceImplementation
      }
      tableOfContents(maxDepth: 3)
    }
  }
`;
