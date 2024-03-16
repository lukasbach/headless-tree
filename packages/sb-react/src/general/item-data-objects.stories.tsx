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
  title: "React/General/Item Data Objects",
} satisfies Meta;

export default meta;

// story-start
interface Item {
  name: string;
  children?: string[];
  isFolder?: boolean;
  isRed?: boolean;
}

const items: Record<string, Item> = {
  root: { name: "Root", children: ["folder1", "folder2"], isFolder: true },
  folder1: { name: "Folder 1", children: ["item1", "item2"], isFolder: true },
  folder2: {
    name: "Folder 2 (red)",
    children: ["folder3"],
    isFolder: true,
    isRed: true,
  },
  folder3: { name: "Folder 3", children: ["item3"], isFolder: true },
  item1: { name: "Item 1 (red)", isRed: true },
  item2: { name: "Item 2" },
  item3: { name: "Item 3" },
};

export const ItemDataObjects = () => {
  const tree = useTree<Item>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => Boolean(item.getItemData().isFolder),
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId].children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
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
            style={{ color: item.getItemData().isRed ? "red" : undefined }}
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
