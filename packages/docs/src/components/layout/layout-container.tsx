import React, { FC, ReactNode, useState } from "react";
import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Sidebar } from "@/components/layout/sidebar";
import { HeaderBar } from "@/components/layout/header-bar";

export type LayoutContainerProps = {
  children: ReactNode;
  location: string;
};

export const LayoutContainer: FC<LayoutContainerProps> = ({
  children,
  location,
}) => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: false,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme }}
      >
        <AppShell
          header={<HeaderBar />}
          navbar={<Sidebar location={location} />}
          padding={0}
        >
          {children}
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
