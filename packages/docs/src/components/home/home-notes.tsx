import { FC } from "react";
import Link from "@docusaurus/Link";
import styles from "./home-notes.module.css";

export const HomeNotes: FC = () => (
  <div className={styles.container}>
    <h2>Support Headless Tree</h2>
    <p>
      If you want to support the maintanence and future of Headless Tree, you
      can sponsor its development on{" "}
      <Link to="https://github.com/sponsors/lukasbach">Github Sponsors</Link>,
      our you can contribute to its development by checking out the{" "}
      <Link to="/contributing/overview">contributing guides</Link> to see how
      you can support with the development of features or bug fixes.
    </p>

    <h2>Start using Headless Tree now!</h2>

    <div className={styles.center}>
      <Link className="button button--primary button--lg" to="/getstarted">
        Get Started
      </Link>
    </div>
  </div>
);
