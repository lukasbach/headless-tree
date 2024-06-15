import { FC } from "react";

export const LinkRow: FC<{ url?: string; title: string; link: string }> = ({
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
