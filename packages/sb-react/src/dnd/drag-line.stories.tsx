import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Drag and Drop/Drag Line",
  tags: ["feature/dnd", "basic"],
} satisfies Meta;

export default meta;

// story-start
export const DragLine = () => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canDropInbetween: true,
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId()
        )} on ${target.item.getId()}, index ${target.childIndex}`
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

  const dragLine = tree.getDragLineData();

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
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
              drop: item.isDropTarget() && item.isDraggingOver(),
            })}
          >
            {item.getItemName()}
          </button>
        </div>
      ))}
      {dragLine && (
        <div
          style={{
            top: `${dragLine.top}px`,
            left: `${dragLine.left - 10}px`,
            width: `${dragLine.right - dragLine.left + 10}px`,
            pointerEvents: "none", // important to prevent capturing drag events
          }}
          className="dragline"
        />
      )}
      {dragLine?.right}
      <pre>
        {JSON.stringify(
          {
            dragLine,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};
