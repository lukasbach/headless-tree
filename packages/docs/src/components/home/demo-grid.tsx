import { FC, useState } from "react";
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
    story: "react-drag-and-drop-kitchen-sink--kitchen-sink",
  },
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
];

export const DemoGrid: FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);
  return (
    <div className={styles.container}>
      <DemoBox
        initialStory={demos[selectedDemo]?.story}
        tags={["homepage"]}
        fullWidth
      />
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
