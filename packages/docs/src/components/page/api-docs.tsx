import React, { FC, useEffect, useRef } from "react";
import { Tabs, TypographyStylesProvider, useMantineTheme } from "@mantine/core";
import IframeResizer from "iframe-resizer-react";

export type ApiDocsProps = {
  data: Queries.DocByIdQuery;
};

const DocsIframe: FC<{ src: string }> = ({ src }) => {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const theme = useMantineTheme();
  useEffect(() => {
    ref.current?.contentDocument?.documentElement.setAttribute(
      "data-theme",
      theme.colorScheme
    );
  }, [theme]);
  return (
    <IframeResizer
      src={src}
      style={{ width: "100%", border: "none" }}
      onLoad={(e) => {
        const iframe = e.target as HTMLIFrameElement;
        if (!iframe.contentDocument) {
          return;
        }
        ref.current = iframe;
        const script = iframe.contentDocument.createElement("script");
        script.src =
          "https://www.unpkg.com/iframe-resizer@4.3.6/js/iframeResizer.contentWindow.min.js";

        iframe.contentDocument.head.appendChild(script);

        iframe.contentDocument?.documentElement.setAttribute(
          "data-theme",
          theme.colorScheme
        );
        iframe.contentDocument.body.style.background = "transparent";
        iframe.contentDocument
          .getElementsByClassName("tsd-page-toolbar")
          .item(0)
          ?.remove();
      }}
    />
  );
};

export const ApiDocs: FC<ApiDocsProps> = ({ data }) => {
  return (
    <TypographyStylesProvider>
      <Tabs defaultValue={data.mdx?.frontmatter?.api?.[0]?.name}>
        <Tabs.List>
          {data.mdx?.frontmatter?.api?.map((api) => (
            <Tabs.Tab key={api?.name} value={api?.name ?? ""}>
              {api?.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {data.mdx?.frontmatter?.api?.map((api) => (
          <Tabs.Panel key={api?.name} value={api?.name ?? ""}>
            <DocsIframe src={api?.docs ?? ""} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </TypographyStylesProvider>
  );
};
