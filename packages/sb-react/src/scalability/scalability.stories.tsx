import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeState,
  buildProxiedInstance,
  buildStaticInstance,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { PropsOfArgtype } from "../argtypes";

const meta = {
  title: "React/Scalability/Big Tree",
  tags: ["homepage"],
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
): string[] => {
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

export const BigTree = ({
  itemsPerLevel,
  openLevels,
  useProxyInstances,
}: PropsOfArgtype<typeof meta>) => {
  const [state, setState] = useState<Partial<TreeState<string>>>(() => ({
    expandedItems: getExpandedItemIds(itemsPerLevel, openLevels),
  })); // TODO type error
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
      keyboardDragAndDropFeature,
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
              drop: item.isDragTarget(),
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
