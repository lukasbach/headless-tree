import { graphql, useStaticQuery } from "gatsby";

export const useStories = () =>
  useStaticQuery<Queries.AllStoriesQuery>(graphql`
    query AllStories {
      allStory {
        nodes {
          embed
          kind
          name
          source
          sourcePath
          story
          tags
          title
        }
      }
    }
  `);
