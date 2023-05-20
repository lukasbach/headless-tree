import React, { FC, ReactNode } from "react";
import { Anchor, Box } from "@mantine/core";

export type PageMetaLinkProps = {
  label: string;
  value?: ReactNode | null;
  href?: string | null;
  linkText?: string;
  icon?: ReactNode;
};

export const PageMetaLink: FC<PageMetaLinkProps> = ({
  label,
  value,
  icon,
  linkText,
  href,
}) => {
  return value || href ? (
    <Box sx={{ display: "flex", alignItems: "center" }} my="xs" fz="xs">
      <Box
        sx={(theme) => ({
          width: "100px",
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[2]
              : theme.colors.gray[7],
        })}
      >
        {label}
      </Box>
      <Box>
        {icon} {value}
        {href ? (
          <Anchor href={href} target="_blank">
            {linkText}
          </Anchor>
        ) : null}
      </Box>
    </Box>
  ) : null;
};
