import { graphql, useStaticQuery } from "gatsby";

export const useNavbarData = () =>
  useStaticQuery<Queries.NavbarDataQuery>(graphql`
    query NavbarData {
      allMdx {
        nodes {
          frontmatter {
            category
            slug
            title
          }
        }
      }
    }
  `);
