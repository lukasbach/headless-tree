import React, { FC, ReactNode } from "react";
import { Box, createStyles, Navbar, NavLink } from "@mantine/core";
import { Link } from "gatsby";
import { useNavbarData } from "@/queries/use-navbar-data";

export type SidebarProps = { location: string };

const categories = [
  { key: "intro", name: "Intro" },
  { key: "feature", name: "Features" },
  { key: "demos", name: "Demos" },
];

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    borderRadius: 8,
    paddingTop: "4px",
    paddingBottom: "4px",
    "&[data-active]": {
      fontWeight: "bold",
    },
    "[data-active]:before": {
      content: '""',
      position: "absolute",
      borderRadius: 16,
      left: -6,
      top: 6,
      bottom: 6,
      width: 4,
      backgroundColor:
        theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 6 : 7],
    },
  },
}));

export const Sidebar: FC<SidebarProps> = ({ location }) => {
  const styles = useStyles();
  const allItems = useNavbarData();
  return (
    <Navbar width={{ base: 200 }}>
      {categories.map(({ key, name }) => {
        const items = allItems.allMdx.nodes.filter(
          (node) => node.frontmatter?.category === key
        );
        return (
          <Box key={key} sx={{ padding: 16 }}>
            <Box>{name}</Box>
            {items.map((item) => (
              <NavLink
                key={item.frontmatter?.href ?? item.frontmatter?.slug ?? "#"}
                classNames={styles.classes}
                component={Link}
                to={item.frontmatter?.href ?? item.frontmatter?.slug ?? "#"}
                label={item.frontmatter?.title}
                active={
                  location.replaceAll("/", " ").trim().replaceAll(" ", "/") ===
                  item.frontmatter?.slug
                    ?.replaceAll("/", " ")
                    .trim()
                    .replaceAll(" ", "/")
                }
              />
            ))}
          </Box>
        );
      })}
    </Navbar>
  );
};
