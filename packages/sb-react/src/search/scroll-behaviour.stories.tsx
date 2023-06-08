import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  searchFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Search/Scroll Behaviour",
  tags: ["feature/search"],
} satisfies Meta;

export default meta;

// story-start
export const ScrollBehaviour = () => {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    initialState: {
      expandedItems: [
        "root-1",
        "root-2",
        "root-3",
        "root-1-1",
        "root-1-2",
        "root-1-3",
        "root-2-1",
        "root-2-2",
        "root-2-3",
        "root-3-1",
        "root-3-2",
        "root-3-3",
      ],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      searchFeature,
    ],
  });

  return (
    <>
      <div className="description">
        <p>
          This is the same as the basic search example, but with more items
          opened by default to demonstrate how the tree automatically scrolls to
          the focused item when navigating with the keyboard.
        </p>
        <p>
          Try searching for "1-1", then press the down-arrow-key multiple times.
        </p>
      </div>
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
                searchmatch: item.isMatchingSearch(),
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
