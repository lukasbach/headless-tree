import React, { FC } from "react";
import { Box } from "@mantine/core";
import { Link } from "gatsby-link";
import { navigate } from "gatsby";

export type TocItem = {
  url: string;
  title: string;
  items?: TocItem[];
};

export type TocItemsProps = {
  items: TocItem[];
};

export const TocItems: FC<TocItemsProps> = ({ items }) => {
  return (
    <Box
      component="ul"
      sx={{
        padding: 0,
        margin: 0,
        paddingLeft: 20,
      }}
    >
      {items.map((item) => (
        <Box
          component="li"
          key={item.url}
          sx={(theme) => ({
            listStyleType: "none",
            borderLeft: "1px solid",
            borderLeftColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[3],
          })}
        >
          <Box
            component={Link}
            to={item.url}
            sx={(theme) => ({
              display: "block",
              padding: "6px 12px",
              borderRadius: 4,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.colors.gray[9],
              textDecoration: "none",
              ":hover": {
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[1],
              },
              ":active": {
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[2],
              },
            })}
          >
            {item.title}
          </Box>
          {item.items && <TocItems items={item.items} />}
        </Box>
      ))}
    </Box>
  );
};
