import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/State/Distinct State Handlers",
  tags: ["guides/state", "homepage"],
} satisfies Meta;

export default meta;

// story-start
export const DistinctStateHandlers = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

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
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <button
            {...item.getProps()}
            key={item.getId()}
            style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
          >
            <div
              className={cn("treeitem", {
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
      <h3>Selected Items</h3>
      <pre>{JSON.stringify(selectedItems)}</pre>
      <h3>Expanded Items</h3>
      <pre>{JSON.stringify(expandedItems)}</pre>
      <h3>Focused Item</h3>
      <pre>{JSON.stringify(focusedItem)}</pre>

      <div className="actionbar">
        <button
          className="actionbtn"
          onClick={() => {
            setExpandedItems(["root-1", "root-2"]);
            setFocusedItem("root-1-1");
            setSelectedItems(["root-1-1", "root-2-2"]);
          }}
        >
          Overwrite State
        </button>
      </div>
    </>
  );
};
