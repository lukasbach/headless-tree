import type { Meta } from "@storybook/react";
import React from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Guides/Overwriting Internals",
} satisfies Meta;

export default meta;

// story-start
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
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      {
        itemInstance: {
          getProps: ({ prev, item }) => ({
            ...prev(),
            onMouseOver: () => {
              console.log("Mouse over!", item.getId());
            },
          }),
        },
        treeInstance: {
          expandItem: ({ prev }, itemId) => {
            // Run the original implementation
            prev(itemId);

            alert(`Item ${itemId} expanded!`);
          },
          focusNextItem: ({ prev }) => {
            // Run the original implementation
            prev();

            alert("Next item focused!");
          },
        },
        onItemMount: (item, element) => {
          // You can also hook into various lifecycle events. This runs
          // when a tree item is mounted into the DOM.
          console.log("Item mounts!", item.getId(), element);
        },
      } as any, // TODO type
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
        </button>
      ))}
    </div>
  );
};
