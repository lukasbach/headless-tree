import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";
import cx from "classnames";

const meta = {
  title: "React/Dnd",
  argTypes: {
    canDropInbetween: {
      control: "boolean",
    },
    canDropForeignDragObject: {
      control: "boolean",
    },
  },
  args: {
    canDropInbetween: true,
    canDropForeignDragObject: true,
  },
} satisfies Meta;

export default meta;

export const Dnd = ({ canDropInbetween, canDropForeignDragObject }) => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canDropInbetween,
    onDrop: action("onDrop"),
    onDropForeignDragObject: action("onDropForeignDragObject"),
    createForeignDragObject: (items) => ({
      format: "text/plain",
      data: `custom foreign drag object: ${items
        .map((item) => item.getId())
        .join(",")}`,
    }),
    canDropForeignDragObject: () => canDropForeignDragObject,
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
                dropabove: item.isDropTargetAbove() && item.isDraggingOver(),
                dropbelow: item.isDropTargetBelow() && item.isDraggingOver(),
              })}
            >
              {item.getItemName()}
            </button>
          </div>
        ))}
      </div>
      <div
        style={{ marginTop: "40px" }}
        onDrop={(e) =>
          action("onDropExternally")(e.dataTransfer.getData("text/plain"))
        }
        onDragOver={(e) => e.preventDefault()}
      >
        Drop items here!
      </div>
      <div
        style={{ marginTop: "10px" }}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", "hello world");
        }}
      >
        Or drag me into the tree!
      </div>
    </>
  );
};
