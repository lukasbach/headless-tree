import { FC } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useStory } from "@site/src/util/use-story";

const Test: FC = () => {
  const { siteConfig } = useDocusaurusContext();
  console.log(useStory("react-expand-all-basic--basic"));
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <>Hello</>
    </Layout>
  );
};

export default Test;
