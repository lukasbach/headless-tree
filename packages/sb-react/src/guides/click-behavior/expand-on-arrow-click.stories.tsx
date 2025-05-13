import type { Meta } from "@storybook/react";
import React from "react";
import {
  FeatureImplementation,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

import "./expand-on-arrow-click.css";

const meta = {
  title: "React/Guides/Click Behavior/Expand On Arrow Click",
  tags: ["guide/clickbehavior", "basic"],
} satisfies Meta;

export default meta;

// story-start

const customClickBehavior: FeatureImplementation = {
  itemInstance: {
    getProps: ({ tree, item, prev }) => ({
      ...prev?.(),
      onClick: (e: MouseEvent) => {
        if (e.shiftKey) {
          item.selectUpTo(e.ctrlKey || e.metaKey);
        } else if (e.ctrlKey || e.metaKey) {
          item.toggleSelect();
        } else {
          tree.setSelectedItems([item.getItemMeta().itemId]);
        }

        item.setFocused();
      },
    }),
  },
};

export const ExpandOnArrowClick = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    indent: 20,
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
    onDrop: console.log,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      hotkeysCoreFeature,
      customClickBehavior,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree noarrow">
      {tree.getItems().map((item) => (
        <div
          className="outeritem"
          key={item.getId()}
          style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
        >
          {item.isFolder() && (
            <button onClick={item.isExpanded() ? item.collapse : item.expand}>
              {item.isExpanded() ? "v" : ">"}
            </button>
          )}
          <button {...item.getProps()} key={item.getId()}>
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
        </div>
      ))}
      <div style={tree.getDragLineStyle()} className="dragline" />
    </div>
  );
};
