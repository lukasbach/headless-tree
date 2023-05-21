import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Guides/Overwriting Internals",
} satisfies Meta;

export default meta;

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
        createItemInstance: (prev, item) => ({
          ...prev,
          getProps: () => ({
            ...prev.getProps(),
            onMouseOver: () => {
              console.log("Mouse over!", item.getId());
            },
          }),
        }),
        createTreeInstance: (prev, tree) => ({
          ...prev,
          expandItem: (itemId) => {
            // Run the original implementation
            prev.expandItem(itemId);

            alert(`Item ${itemId} expanded!`);
          },
          focusNextItem: () => {
            // Run the original implementation
            prev.focusNextItem();

            alert("Next item focused!");
          },
        }),
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
        <div
          key={item.getId()}
          className="treeitem-parent"
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <button
            {...item.getProps()}
            ref={item.registerElement}
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
            })}
          >
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
