import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  expandAllFeature,
  asyncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Expand All/Async Data",
} satisfies Meta;

export default meta;

// story-start
// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cancelToken = { current: false };

export const AsyncData = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    state: {},
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) =>
      !item.getItemData().endsWith("item") && item.getItemMeta().level < 3,
    createLoadingItemData: () => "Loading...",
    asyncDataLoader: {
      getItem: (itemId) => wait(800).then(() => itemId),
      getChildren: (itemId) =>
        wait(800).then(() => [
          `${itemId}-1`,
          `${itemId}-2`,
          `${itemId}-1item`,
          `${itemId}-2item`,
          `${itemId}-3item`,
        ]),
    },
    dataLoader: null as any,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      expandAllFeature,
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
          }, 1000);
        }}
      >
        Cancel Expanding
      </button>
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
            <button onClick={() => item.expandAll(cancelToken)}>+</button>
            <button onClick={item.collapseAll}>-</button>
          </div>
        ))}
      </div>
      <pre>
        Loading: {JSON.stringify(tree.getState().loadingItems, null, 2)}
      </pre>
    </>
  );
};
