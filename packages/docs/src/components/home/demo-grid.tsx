import { FC, useEffect, useState } from "react";
import { DemoBox } from "@site/src/components/demo/demo-box";
import clsx from "clsx";
import styles from "./demo-grid.module.css";

const demos = [
  {
    title: "Simple Example",
    text: "Easy integration in React with full customizability of DOM",
    story: "react-general-simple-example--simple-example",
  },
  {
    title: "Drag and Drop",
    text: "Powerful ordered drag-and-drop, that can interact with external drag events", // TODO also unordered sample
    story: "react-drag-and-drop-comprehensive-sample--comprehensive-sample",
  },
  // {
  //   title: "Scalable",
  //   text: "Headless Tree remains performant even with large trees",
  //   story: "react-scalability-big-tree--big-tree",
  // },
  {
    title: "Virtualization Support",
    text: "Compatible with common virtualization library to support 100k+ items",
    story: "react-scalability-basic-virtualization--basic-virtualization",
  },
  {
    title: "Hotkeys!",
    text: "Lots of hotkeys, fully customizable",
    story: "react-hotkeys-overwriting-hotkeys--overwriting-hotkeys",
  },
  {
    title: "Search Support",
    text: "Typeahead anywhere in the tree to quickly search the entire tree",
    story: "react-search-basic--basic",
  },
  {
    title: "Rename items",
    text: "Optionally allow users to rename items inside the tree",
    story: "react-renaming-basic--basic",
  },
  {
    title: "Checkboxes",
    text: "Support for checkboxes to select items",
    story: "react-checkboxes-general--general",
  },
  {
    title: "Manage State",
    text: "Let Headless Tree manage tree state internally, or manage any part of it yourself",
    story: "react-state-distinct-state-handlers--distinct-state-handlers",
  },
  {
    title: "Customize Behavior",
    text: "Easily overwrite internal behavior like requiring double clicks on items to expand",
    story:
      "react-guides-click-behavior-expand-on-double-click--expand-on-double-click",
  },
  {
    title: "Customize Logic",
    text: "Overwrite or expand any internal behavior of Headless Tree",
    story: "react-guides-overwriting-internals--overwriting-internals",
  },
  {
    title: "Async Data Support",
    text: "Use synchronous or asynchronous data sources for your tree. Headless Tree comes with optional caching for async data",
    story: "react-async-data-loading--async-data-loading",
  },
  {
    title: "Comprehensive Sample",
    text: "Sample with all features enabled",
    story: "react-general-comprehensive-sample--comprehensive-sample",
  },
];

export const DemoGrid: FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);

  useEffect(() => {
    const search = new URLSearchParams(document.location.search);
    if (search.has("demo")) {
      const demo = parseInt(search.get("demo"), 10);
      if (demo >= 0 && demo < demos.length) {
        setSelectedDemo(demo);
      }
    }
  }, []);

  return (
    <div className={styles.container} id="demogrid">
      <DemoBox
        initialStory={demos[selectedDemo]?.story}
        tags={["homepage"]}
        fullWidth
      />
      <div className={styles.sampleHeader}>Check out some more samples:</div>
      <div className={styles.demoButtonGrid}>
        {demos.map((demo, index) => (
          <button
            key={demo.story}
            type="button"
            onClick={() => setSelectedDemo(index)}
            className={clsx(
              styles.demoButton,
              selectedDemo === index && styles.demoButtonSelected,
            )}
          >
            <div className={styles.demoTitle}>{demo.title}</div>
            <p className={styles.demoText}>{demo.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
