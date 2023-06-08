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
  title: "React/Search/Custom Matcher",
} satisfies Meta;

export default meta;

const rootItem = { name: "Root", color: "black" };

const coloredItems = [
  { name: "Item 1", color: "red" },
  { name: "Item 2", color: "green" },
  { name: "Item 3", color: "purple" },
  { name: "Item 4", color: "orange" },
  { name: "Item 5", color: "blue" },
];

// TODO when entering a search, then hitting escape, why is the found item not focused?

export const CustomMatcher = () => {
  const tree = useTree<typeof rootItem>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getId() === "root",
    dataLoader: {
      getItem: (itemId) =>
        itemId === "root"
          ? rootItem
          : coloredItems.find((item) => item.name === itemId)!,
      getChildren: (itemId) => coloredItems.map((item) => item.name),
    },
    isSearchMatchingItem: (searchQuery, item) =>
      item.getItemData().color.includes(searchQuery),
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
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      searchFeature,
    ],
  });

  return (
    <>
      <p className="description">
        This example uses a custom matcher that matches the name of the item
        color, not the name. Try searching for "blue" or "red".
      </p>
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
      )}
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
              style={{ color: item.getItemData().color }}
            >
              {item.getItemName()}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
