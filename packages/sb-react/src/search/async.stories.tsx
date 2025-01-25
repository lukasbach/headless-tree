import type { Meta } from "@storybook/react";
import React from "react";
import {
  asyncDataLoaderFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Search/Async Search Tree",
  tags: ["feature/search", "basic", "feature/async"],
} satisfies Meta;

export default meta;

// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// story-start
export const AsyncSearchTree = () => {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    createLoadingItemData: () => "Loading...",
    asyncDataLoader: {
      getItem: (itemId) => wait(800).then(() => itemId),
      getChildren: (itemId) =>
        wait(800).then(() => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`]),
    },
    initialState: {
      expandedItems: [
        "root-1",
        "root-2",
        "root-3",
        "root-1-1",
        "root-1-2",
        "root-1-3",
      ],
    },
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      searchFeature,
    ],
  });

  return (
    <>
      <p>
        <button onClick={() => tree.openSearch()}>Open Search</button> or press
        any letter keys while focusing the tree to search.
      </p>
      {tree.isSearchOpen() && (
        <p>Navigate between search results with ArrowUp and ArrowDown.</p>
      )}
      {tree.isSearchOpen() && (
        <>
          <input
            {...tree.getSearchInputElementProps()}
            ref={tree.registerSearchInputElement}
          />{" "}
          ({tree.getSearchMatchingItems().length} matches)
        </>
      )}{" "}
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
                searchmatch: item.isMatchingSearch(),
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
