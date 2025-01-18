import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  asyncDataLoaderFeature,
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Async Data Loading",
  tags: ["feature/async-data-loader"],
} satisfies Meta;

export default meta;

// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// story-start
export const AsyncDataLoading = () => {
  const [loaderName, setLoaderName] = useState("Loading...");
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    createLoadingItemData: () => loaderName,
    asyncDataLoader: {
      getItem: (itemId) => wait(800).then(() => itemId),
      getChildren: (itemId) =>
        wait(800).then(() => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`]),
    },
    dataLoader: null as any,
    indent: 20,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  return (
    <>
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
              {item.isLoading() && " (loading...)"}
            </div>
            <button onClick={() => item.invalidateItemData()}>[i1]</button>
            <button onClick={() => item.invalidateChildrenIds()}>[i2]</button>
          </button>
        ))}
      </div>
      <p>
        Press [i1] to invalidate item data, or [i2] to invalidate its children
        array.
      </p>
      <div>
        Loading item name:{" "}
        <input
          value={loaderName}
          onChange={(e) => setLoaderName(e.target.value)}
        />
      </div>
    </>
  );
};
