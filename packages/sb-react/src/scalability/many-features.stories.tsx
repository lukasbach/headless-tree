import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Scalability/Many Features",
  argTypes: {
    featureCount: {
      type: "number",
    },
  },
  args: {
    featureCount: 100,
  },
} satisfies Meta;

export default meta;

// story-start

declare module "@headless-tree/core" {
  export interface ItemInstance<T> {
    logSomething: () => void;
    logCascading: (counter: number) => void;
  }
}

let counter = 0;

const createFeature = () => ({
  key: `custom-${counter++}`,
  itemInstance: {
    logSomething: ({}, value: number) => {
      console.log("Single call", value);
    },
    logCascading: ({ prev }, value: number) => {
      const prevValue = prev?.(value + 1);
      if (!prevValue) {
        console.log("Cascading call", value);
      }
    },
  },
});

export const ManyFeatures = ({ featureCount }) => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-1item`,
        `${itemId}-2item`,
        `${itemId}-3item`,
      ],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      ...Array.from({ length: featureCount }, createFeature),
    ],
  });

  return (
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <button
          {...item.getProps()}
          ref={item.registerElement}
          key={item.getId()}
          style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <div
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
            })}
          >
            {item.getItemName()}
          </div>
          <button onClick={() => item.logSomething()}>normal</button>
          <button onClick={() => item.logCascading(0)}>cascade</button>
        </button>
      ))}
    </div>
  );
};
