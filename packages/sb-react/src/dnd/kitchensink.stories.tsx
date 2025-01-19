import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";
import cx from "classnames";

const meta = {
  title: "React/Drag and Drop/Kitchen Sink",
  tags: ["feature/dnd", "complex-story"],
  argTypes: {
    canDropInbetween: {
      control: "boolean",
    },
    canDropForeignDragObject: {
      control: "boolean",
    },
    topLinePercentage: {
      control: { type: "number", min: 0, max: 1, step: 0.1 },
      defaultValue: 0.2,
    },
    bottomLinePercentage: {
      control: { type: "number", min: 0, max: 1, step: 0.1 },
      defaultValue: 0.2,
    },
  },
  args: {
    canDropInbetween: true,
    canDropForeignDragObject: true,
  },
} satisfies Meta;

export default meta;

// story-start
export const KitchenSink = ({
  canDropInbetween,
  canDropForeignDragObject,
  topLinePercentage,
  bottomLinePercentage,
}) => {
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
    topLinePercentage,
    bottomLinePercentage,
    indent: 20,
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
                drop: item.isDropTarget(),
              })}
            >
              {item.getItemName()}
            </div>
          </button>
        ))}
        <div style={tree.getDragLineStyle()} className="dragline" />
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
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", "hello world");
        }}
      >
        Or drag me into the tree!
      </div>
    </>
  );
};
