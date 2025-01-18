import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Drag and Drop/Can Drop",
  tags: ["feature/dnd", "basic"],
} satisfies Meta;

export default meta;

// story-start
export const CanDrop = () => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canDropInbetween: true,
    canDrop: (items, { item }) =>
      item.getItemName().endsWith("1") || item.getItemName().endsWith("2"),
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId(),
        )} on ${target.item.getId()}, index ${target.childIndex}`,
      );
    },
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-4`,
        `${itemId}-5`,
        `${itemId}-6`,
      ],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  return (
    <>
      <p className="description">
        Only on items that end with 1 or 2 can be dropped on.
      </p>
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
                drop: item.isDropTarget() && item.isDraggingOver(),
                dropabove: item.isDropTargetAbove() && item.isDraggingOver(),
                dropbelow: item.isDropTargetBelow() && item.isDraggingOver(),
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
