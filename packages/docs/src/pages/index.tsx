import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import { storybookRoot } from "@site/src/components/demo/demo-box";
import { DemoGrid } from "@site/src/components/home/demo-grid";
import { HomeNotes } from "@site/src/components/home/home-notes";
import { RiBlueskyFill, RiGithubFill } from "react-icons/ri";
import { BsDiscord } from "react-icons/bs";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={styles.heroBannerInner}>
        <div className={styles.heroLeft}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>
            The definitive tree component
            <br /> for the Web
          </p>
          <p className={styles.heroText}>
            Super-easy integration of complex tree components into React.
            Supports ordered and unordered drag-and-drop, extensive keybindings,
            search, renaming and more. Fully customizable and accessible.
            Headless Tree is the official successor for{" "}
            <Link to="https://rct.lukasbach.com/">React Complex Tree</Link>.
          </p>
          <p className={styles.heroText}>
            Read the{" "}
            <Link to="https://medium.com/@lukasbach/headless-tree-and-the-future-of-react-complex-tree-fc920700e82a">
              blog post about the change on Medium
            </Link>
            .
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/getstarted"
            >
              Get Started
            </Link>
            <Link
              className={`button button--outline button--secondary button--lg ${styles.socialBtn}`}
              to="https://discord.gg/KuZ6EezzVw"
            >
              <BsDiscord size="2rem" />
            </Link>
            <Link
              className={`button button--outline button--secondary button--lg ${styles.socialBtn}`}
              to="https://bsky.app/profile/lukasbach.bsky.social"
            >
              <RiBlueskyFill size="2rem" />
            </Link>
            <Link
              className={`button button--outline button--secondary button--lg ${styles.socialBtn}`}
              to="https://github.com/lukasbach/headless-tree"
            >
              <RiGithubFill size="2rem" />
            </Link>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroDemo}>
            <iframe
              title="Demo"
              src={`${storybookRoot}/iframe.html?path=/story/react-general-comprehensive-sample--comprehensive-sample`}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description={siteConfig.tagline}>
      <HomepageHeader />
      <DemoGrid />
      <HomeNotes />
    </Layout>
  );
}
