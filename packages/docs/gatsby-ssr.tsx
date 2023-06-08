import * as React from "react";
import { renderToString } from "react-dom/server";
import { createStylesServer, ServerStyles } from "@mantine/ssr";

const stylesServer = createStylesServer();

export const replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const html = renderToString(bodyComponent);
  setHeadComponents([<ServerStyles html={html} server={stylesServer} />]);
  replaceBodyHTMLString(html);
};

export const onRenderBody = ({ setHtmlAttributes }: any) => {
  setHtmlAttributes({ lang: "en" });
};
