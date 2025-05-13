import type { Meta } from "@storybook/react";
import React from "react";
import {
  FeatureImplementation,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Guides/Overwriting Internals",
  tags: ["homepage"],
} satisfies Meta;

export default meta;

// story-start
const customFeature: FeatureImplementation = {
  itemInstance: {
    getProps: ({ prev, item }) => ({
      ...prev?.(),
      onMouseOver: () => {
        console.log("Mouse over!", item.getId());
      },
    }),
    expand: ({ prev, itemId }) => {
      // Run the original implementation
      prev?.();

      alert(`Item ${itemId} expanded!`);
    },
  },
  onItemMount: (item, element) => {
    // You can also hook into various lifecycle events. This runs
    // when a tree item is mounted into the DOM.
    console.log("Item mounts!", item.getId(), element);
  },
};

export const OverwritingInternals = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-1item`,
        `${itemId}-2item`,
      ],
    },
    indent: 20,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      customFeature,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
        <button
          {...item.getProps()}
          key={item.getId()}
          style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <div
            className={cn("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
            })}
          >
            {item.getItemName()}
          </div>
        </button>
      ))}
    </div>
  );
};
