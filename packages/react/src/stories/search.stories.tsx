import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  searchFeature,
} from "@headless-tree/core";
import { useTree } from "../index";

const meta = {
  title: "React/Search",
} satisfies Meta;

export default meta;

export const Search = () => {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item,
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
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
      {tree.isSearchOpen() && (
        <input
          {...tree.getSearchInputElementProps()}
          ref={tree.registerSearchInputElement}
        />
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
              className="treeitem"
              data-focused={item.isFocused()}
              data-expanded={item.isExpanded()}
              data-selected={item.isSelected()}
            >
              {item.isExpanded() ? "v " : "> "}
              {item.getItemName()}
              {item.isMatchingSearch() && " (matching search)"}
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => tree.openSearch()}>Open Search</button>
    </>
  );
};
