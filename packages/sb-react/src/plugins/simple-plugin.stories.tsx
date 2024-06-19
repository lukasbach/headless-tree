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
  title: "React/Plugins/Simple Plugin",
  tags: ["guide/plugin", "basic"],
} satisfies Meta;

export default meta;

// story-start

declare module "@headless-tree/core" {
  export interface ItemInstance<T> {
    alertChildren: () => void;
  }
}

export const SimplePlugin = () => {
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
          alertChildren: ({ item }) => {
            alert(
              item
                .getChildren()
                .map((child) => child.getItemName())
                .join(", "),
            );
          },
        },
      },
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
          <button onClick={item.alertChildren}>X</button>
        </div>
      ))}
    </div>
  );
};
