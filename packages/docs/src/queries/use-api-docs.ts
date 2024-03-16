import { graphql, useStaticQuery } from "gatsby";

export const useApiDocs = () =>
  useStaticQuery<Queries.AllApiDocsQuery>(graphql`
    query AllApiDocs {
      allApiDoc {
        nodes {
          file
          markdown
        }
      }
    }
  `);
