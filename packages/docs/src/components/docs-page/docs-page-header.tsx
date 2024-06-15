import { FC, PropsWithChildren } from "react";
import styles from "./styles.module.css";

export const DocsPageHeader: FC<
  PropsWithChildren<{
    title: string;
    subtitle?: string;
  }>
> = ({ children, title, subtitle }) => (
  <header className={styles.container}>
    <h1 className={styles.title}>{title}</h1>
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    {!!children && (
      <table className={styles.dataTable}>
        <tbody>{children}</tbody>
      </table>
    )}
  </header>
);
