import React, { FC } from "react";
import {
  ActionIcon,
  Header,
  useMantineColorScheme,
  Box,
  MantineProvider,
} from "@mantine/core";
import { IoMoonOutline, IoSunnyOutline, IoLogoGithub } from "react-icons/io5";
import { Link } from "gatsby-link";

export type HeaderBarProps = {};

export const HeaderBar: FC<HeaderBarProps> = ({}) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  return (
    <MantineProvider theme={{ colorScheme: "dark", primaryColor: "grape" }}>
      <Header
        height={60}
        bg="dark.9"
        color="gray.0"
        px={20}
        sx={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            display: "block",
            color: "#fff",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Headless Tree
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <ActionIcon
          size="lg"
          radius="md"
          variant="default"
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {dark ? <IoSunnyOutline /> : <IoMoonOutline />}
        </ActionIcon>
        <ActionIcon
          ml={8}
          target="_blank"
          component={Link}
          to="https://github.com/lukasbach/headless-tree"
          size="lg"
          radius="md"
          variant="default"
        >
          <IoLogoGithub />
        </ActionIcon>
      </Header>
    </MantineProvider>
  );
};
