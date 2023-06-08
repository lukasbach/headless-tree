import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/State/Distinct State Handlers",
  tags: ["guides/state", "react/state/distinct-state-handlers"],
} satisfies Meta;

export default meta;

// story-start
export const DistinctStateHandlers = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [focusedItem, setFocusedItem] = useState(null);

  const tree = useTree<string>({
    state: { selectedItems, expandedItems, focusedItem },
    rootItemId: "root",
    setSelectedItems,
    setExpandedItems,
    setFocusedItem,
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <>
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
      <h3>Selected Items</h3>
      <pre>{JSON.stringify(selectedItems)}</pre>
      <h3>Expanded Items</h3>
      <pre>{JSON.stringify(expandedItems)}</pre>
      <h3>Focused Item</h3>
      <pre>{JSON.stringify(focusedItem)}</pre>
    </>
  );
};
