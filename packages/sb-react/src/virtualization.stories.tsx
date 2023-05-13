import type { Meta } from "@storybook/react";
import React, { useState, useRef } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  DropTarget,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useVirtualizer } from "@tanstack/react-virtual";

const meta = {
  title: "React/Virtualization",
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

const Inner = ({ tree }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: tree.getItems().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 27,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: `400px`,
        overflow: "auto",
      }}
    >
      <div
        ref={tree.registerElement}
        className="tree"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = tree.getItems()[virtualItem.index];
          return (
            <div
              key={item.getId()}
              className="treeitem-parent"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
                marginLeft: `${item.getItemMeta().level * 20}px`,
              }}
            >
              <button
                {...item.getProps()}
                ref={item.registerElement}
                className="treeitem"
                data-focused={item.isFocused()}
                data-expanded={item.isExpanded()}
                data-selected={item.isSelected()}
                data-drop={item.isDropTarget() && item.isDraggingOver()}
                data-dropabove={
                  item.isDropTargetAbove() && item.isDraggingOver()
                }
                data-dropbelow={
                  item.isDropTargetBelow() && item.isDraggingOver()
                }
              >
                {item.isFolder() && item.isExpanded() ? "v " : ""}
                {item.isFolder() && !item.isExpanded() ? "> " : ""}
                {item.getItemName()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Virtualization = ({ itemsPerLevel, openLevels }) => {
  const [, setDnd] = useState<DropTarget<any> | null>(null);
  const [state, setState] = useState(() => ({
    expandedItems: getExpandedItemIds(itemsPerLevel, openLevels),
  }));
  const tree = useTree<string>({
    state,
    onStateChange: setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    onUpdateDragPosition: setDnd,
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

  return <Inner tree={tree} />;
};
