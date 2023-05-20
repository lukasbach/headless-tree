import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

const meta = {
  title: "React/Distinct State Handlers",
} satisfies Meta;

export default meta;

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
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
