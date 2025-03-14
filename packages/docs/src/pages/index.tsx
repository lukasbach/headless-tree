import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import { storybookRoot } from "@site/src/components/demo/demo-box";
import { DemoGrid } from "@site/src/components/home/demo-grid";
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
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <p className={styles.heroText}>
            Super-easy integration of complex tree components into React.
            Supports ordered and unordered drag-and-drop, extensive keybindings,
            search, renaming and more. Fully customizable, accessible. This is
            the official successor library for{" "}
            <Link to="https://rct.lukasbach.com/">React Complex Tree</Link>.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/getstarted"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroDemo}>
            <iframe
              title="Demo"
              src={`${storybookRoot}/iframe.html?path=/story/react-drag-and-drop-kitchen-sink--kitchen-sink`}
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
    </Layout>
  );
}
