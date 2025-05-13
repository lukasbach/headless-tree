import type { Meta } from "@storybook/react";
import React from "react";
import {
  expandAllFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Hotkeys/Custom Hotkeys",
  tags: ["feature/hotkeys", "homepage"],
} satisfies Meta;

export default meta;

// TODO stopped verifying stories after big revampt at this story

// story-start
export const CustomHotkeys = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    indent: 20,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) =>
        itemId.length < 15
          ? [
              `${itemId}-1`,
              `${itemId}-2`,
              `${itemId}-3`,
              `${itemId}-1item`,
              `${itemId}-2item`,
            ]
          : [],
    },
    hotkeys: {
      // Begin the hotkey name with "custom" to satisfy the type checker
      customExpandAll: {
        hotkey: "KeyQ",
        handler: (e, tree) => {
          tree.expandAll();
        },
      },
      customCollapseAll: {
        hotkey: "KeyW",
        handler: (e, tree) => {
          tree.collapseAll();
        },
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      expandAllFeature,
    ],
  });

  return (
    <>
      <p className="description">
        In this example, two additional custom hotkeys are defined: Press
        &quot;q&quot; while the tree is focused to expand all items, and press
        &quot;w&quot; to collapse all items.
      </p>
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
              })}
            >
              {item.getItemName()}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};
