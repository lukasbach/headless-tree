import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  buildProxiedInstance,
  buildStaticInstance,
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
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
    useProxyInstances: {
      type: "boolean",
    },
  },
  args: {
    itemsPerLevel: 10,
    openLevels: 2,
    useProxyInstances: true,
  },
} satisfies Meta;

export default meta;

// story-start
const getExpandedItemIds = (
  itemsPerLevel: number,
  openLevels: number,
  prefix = "folder",
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
      getExpandedItemIds(itemsPerLevel, openLevels - 1, itemId),
    ),
  ];
};

export const BigTree = ({ itemsPerLevel, openLevels, useProxyInstances }) => {
  const [state, setState] = useState(() => ({
    expandedItems: getExpandedItemIds(itemsPerLevel, openLevels),
  }));
  const tree = useTree<string>({
    instanceBuilder: useProxyInstances
      ? buildProxiedInstance
      : buildStaticInstance,
    state,
    setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    canReorder: true,
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    indent: 20,
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
              drop: item.isDropTarget(),
            })}
          >
            {item.getItemName()}
          </div>
        </button>
      ))}
      <div style={tree.getDragLineStyle()} className="dragline" />
    </div>
  );
};
