import React from "react";
import { graphql, PageProps } from "gatsby";

export default function DocPage({
  data,
  location,
  children,
}: PageProps<Queries.DocByIdQuery>) {
  return (
    <article>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {children}
    </article>
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
        storybook
        template
      }
      tableOfContents(maxDepth: 1)
    }
  }
`;
