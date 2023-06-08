import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Scalability/Big Tree",
  argTypes: {
    itemsPerLevel: {
      type: "number",
    },
    openLevels: {
      type: "number",
    },
  },
  args: {
    itemsPerLevel: 10,
    openLevels: 2,
  },
} satisfies Meta;

export default meta;

const getExpandedItemIds = (
  itemsPerLevel: number,
  openLevels: number,
  prefix = "folder"
) => {
  if (openLevels === 0) {
    return [];
  }

  const expandedItems: string[] = [];

  for (let i = 0; i < itemsPerLevel; i++) {
    expandedItems.push(`${prefix}-${i}`);
  }

  return [
    ...expandedItems,
    ...expandedItems.flatMap((itemId) =>
      getExpandedItemIds(itemsPerLevel, openLevels - 1, itemId)
    ),
  ];
};

export const BigTree = ({ itemsPerLevel, openLevels }) => {
  const [state, setState] = useState(() => ({
    expandedItems: getExpandedItemIds(itemsPerLevel, openLevels),
  }));
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    canDropInbetween: true,
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => {
        const items: string[] = [];
        for (let i = 0; i < itemsPerLevel; i++) {
          items.push(`${itemId}-${i}`);
        }
        return items;
      },
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
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
              drop: item.isDropTarget() && item.isDraggingOver(),
              dropabove: item.isDropTargetAbove() && item.isDraggingOver(),
              dropbelow: item.isDropTargetBelow() && item.isDraggingOver(),
            })}
          >
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
