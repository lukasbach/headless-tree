import { FC, PropsWithChildren } from "react";
import { LinkRow } from "@site/src/components/docs-page/link-row";
import { DocsPageHeader } from "@site/src/components/docs-page/docs-page-header";
import * as cases from "case";
import styles from "./styles.module.css";

const camelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

export const FeaturePageHeader: FC<
  PropsWithChildren<{
    title: string;
    subtitle?: string;
    feature: string;
    isCore?: boolean;
  }>
> = ({ title, subtitle, children, feature, isCore }) => {
  return (
    <DocsPageHeader title={title} subtitle={subtitle}>
      <LinkRow
        link="View Source"
        title="Source"
        url={`https://github.com/lukasbach/headless-tree/blob/main/packages/core/src/features/${feature}/feature.ts`}
      />
      <LinkRow
        link="View Types"
        title="Types"
        url={`https://github.com/lukasbach/headless-tree/blob/main/packages/core/src/features/${feature}/types.ts`}
      />
      {!isCore && (
        <tr>
          <td>Import</td>
          <td className={styles.code}>
            import{" "}
            {`{ ${cases.camel(feature)}Feature } from "@headless-tree/core`}
          </td>
        </tr>
      )}
      <tr>
        <td>Type Documentation</td>
        <td>
          <a
            href={`/api/core/interface/${cases.camel(feature)}FeatureConfig`}
            className={styles.typedocLink}
          >
            Configuration
          </a>
          <a
            href={`/api/core/interface/${cases.camel(feature)}FeatureState`}
            className={styles.typedocLink}
          >
            State
          </a>
          <a
            href={`/api/core/interface/${cases.camel(feature)}FeatureTreeInstance`}
            className={styles.typedocLink}
          >
            Tree Instance
          </a>
          <a
            href={`/api/core/interface/${cases.camel(feature)}FeatureItemInstance`}
            className={styles.typedocLink}
          >
            Item Instance
          </a>
        </td>
      </tr>
      {children}
    </DocsPageHeader>
  );
};
