import type { Preview } from "@storybook/react";
import { configureActions } from '@storybook/addon-actions';

configureActions({
  depth: 100,
  limit: 40,
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

import "./style.css";

export default preview;
