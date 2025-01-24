import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Misc/Sync Tree used in Unit Tests",
  tags: ["misc/unittest"],
} satisfies Meta;

export default meta;

// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// story-start
export const UnitTestAsync = () => {
  const tree = useTree<string>({
    rootItemId: "x",
    createLoadingItemData: () => "loading",
    dataLoader: {
      getItem: (id) => id,
      getChildren: (id) => [`${id}1`, `${id}2`, `${id}3`, ` ${id}4`],
    },
    getItemName: (item) => item.getItemData(),
    indent: 20,
    isItemFolder: (item) => item.getItemMeta().level < 2,
    initialState: {
      expandedItems: ["x1", "x11"],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
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
            })}
          >
            {item.getItemName()}
          </div>
        </button>
      ))}
    </div>
  );
};
