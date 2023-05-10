import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  DropTarget,
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";

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
  const [dnd, setDnd] = useState<DropTarget<any> | null>(null);
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    onStateChange: setState,
    rootItemId: "root",
    getItemName: (item) => item,
    isItemFolder: () => true,
    onUpdateDragPosition: setDnd,
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
              className="treeitem"
              data-focused={item.isFocused()}
              data-expanded={item.isExpanded()}
              data-selected={item.isSelected()}
              data-drop={item.isDropTarget() && item.isDraggingOver()}
              data-dropabove={item.isDropTargetAbove() && item.isDraggingOver()}
              data-dropbelow={item.isDropTargetBelow() && item.isDraggingOver()}
            >
              {item.isExpanded() ? "v " : "> "}
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

      <pre>{JSON.stringify(dnd, null, 2)}</pre>
    </>
  );
};
