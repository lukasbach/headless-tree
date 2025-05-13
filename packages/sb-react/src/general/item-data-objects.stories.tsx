import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

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
    indent: 20,
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
        <button
          {...item.getProps()}
          key={item.getId()}
          style={{
            paddingLeft: `${item.getItemMeta().level * 20}px`,
            color: item.getItemData().isRed ? "red" : undefined,
          }}
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
