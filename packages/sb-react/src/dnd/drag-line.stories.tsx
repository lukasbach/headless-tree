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

  const dragLine = tree.getDragLineData();
  console.log(dragLine);

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
              drop: item.isDropTarget() && item.isDraggingOver(),
            })}
          >
            {item.getItemName()}
          </div>
        </button>
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
      <pre>
        {JSON.stringify(
          {
            dragLine,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
};
