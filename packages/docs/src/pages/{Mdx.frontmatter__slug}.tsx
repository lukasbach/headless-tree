import React from "react";
import { graphql, PageProps } from "gatsby";
import { LayoutContainer } from "@/components/layout/layout-container";
import { PageContainer } from "@/components/page/page-container";

export default function DocPage({
  data,
  location,
  children,
}: PageProps<Queries.DocByIdQuery>) {
  return (
    <LayoutContainer location={location.pathname}>
      <PageContainer data={data}>{children}</PageContainer>
    </LayoutContainer>
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
        metalinks {
          code
          href
          label
          language
          name
        }
        import
        storybook
        template
      }
      tableOfContents(maxDepth: 3)
    }
  }
`;
