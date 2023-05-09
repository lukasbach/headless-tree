import React from "react";
import { graphql, PageProps } from "gatsby";
import { LayoutContainer } from "../components/layout/layout-container";
import { FeaturePage } from "../components/feature-page/feature-page";

export default function DocPage({
  data,
  location,
  children,
}: PageProps<Queries.DocByIdQuery>) {
  return (
    <LayoutContainer location={location.pathname}>
      <FeaturePage data={data}>{children}</FeaturePage>
      <article>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </article>
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
      }
      tableOfContents(maxDepth: 1)
    }
  }
`;
