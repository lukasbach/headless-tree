import { FC } from "react";
import styles from "./styles.module.css";

const LinkRow: FC<{ url?: string; title: string; link: string }> = ({
  url,
  link,
  title,
}) => {
  return url ? (
    <tr>
      <td>{title}</td>
      <td>
        <a href={url} target="_blank" rel="noreferrer">
          {link}
        </a>
      </td>
    </tr>
  ) : null;
};

export const DocsPageHeader: FC<{
  title: string;
  subtitle?: string;
  sourceLink?: string;
  typesLink?: string;
  typeDocLink?: string;
  importText?: string;
}> = ({ title, subtitle, sourceLink, typesLink, typeDocLink, importText }) => {
  const showTable = sourceLink || typesLink || typeDocLink || importText;
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {showTable && (
        <table className={styles.dataTable}>
          <tbody>
            <LinkRow link="View Source" title="Source" url={sourceLink} />
            <LinkRow link="View Types" title="Types" url={typesLink} />
            <LinkRow link="View TypeDoc" title="TypeDoc" url={typeDocLink} />
            {importText && (
              <tr>
                <td>Import</td>
                <td>{importText}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </header>
  );
};
