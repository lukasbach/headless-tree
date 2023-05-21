import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  expandAllFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Hotkeys/Custom Hotkeys",
} satisfies Meta;

export default meta;

export const CustomHotkeys = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
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
        // TODO this doesn't work at all..
        hotkey: "q",
        handler: (e, tree) => {
          tree.expandAll();
        },
      },
      customCollapseAll: {
        hotkey: "w",
        handler: (e, tree) => {
          tree.collapseAll();
        },
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      expandAllFeature,
    ],
  });

  return (
    <>
      <p className="description">
        In this example, two additional custom hotkeys are defined: Press "q"
        while the tree is focused to expand all items, and press "w" to collapse
        all items.
      </p>
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
    </>
  );
};
