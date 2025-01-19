import type { Meta } from "@storybook/react";
import React from "react";
import {
  expandAllFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Expand All/Basic",
  tags: ["feature/expand-all", "basic"],
} satisfies Meta;

export default meta;

// story-start
const cancelToken = { current: false };

export const Basic = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    state: {},
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) =>
      !item.getItemData().endsWith("item") && item.getItemMeta().level < 3,
    createLoadingItemData: () => "Loading...",
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-1item`,
        `${itemId}-2item`,
        `${itemId}-3item`,
      ],
    },
    indent: 20,
    features: [
      selectionFeature,
      hotkeysCoreFeature,
      expandAllFeature,
      syncDataLoaderFeature,
    ],
  });

  return (
    <>
      <button onClick={() => tree.expandAll(cancelToken)}>
        [+] Expand all
      </button>
      <button onClick={tree.collapseAll}>[-] Collapse all</button>
      <button
        onClick={() => {
          cancelToken.current = true;

          // Reset cancel token again. In production, you probably want to
          // do this before the expand operation, i.e. create a new token
          // per expand-all-operation
          setTimeout(() => {
            cancelToken.current = false;
          }, 100);
        }}
      >
        Cancel Expanding
      </button>
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
              })}
            >
              {item.getItemName()}
            </div>
            <button onClick={() => item.expandAll(cancelToken)}>+</button>
            <button onClick={item.collapseAll}>-</button>
          </button>
        ))}
      </div>
    </>
  );
};
