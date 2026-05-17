import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],

  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      modulesToTranspile: ["@headless-tree/core", "@headless-tree/react"],
    },
  },

  docs: {},
};

export default config;