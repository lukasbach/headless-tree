import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Drag and Drop/Drag Inside",
  tags: ["feature/dnd"],
} satisfies Meta;

export default meta;

const { syncDataLoader, data } = createDemoData();
let newItemId = 0;

// story-start
export const DragInside = () => {
  const [state, setState] = useState({});
  const tree = useTree<DemoItem>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    canDropInbetween: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    onDropForeignDragObject: (dataTransfer, target) => {
      const newId = `new-${newItemId++}`;
      data[newId] = {
        name: dataTransfer.getData("text/plain"),
      };
      insertItemsAtTarget([newId], target, (item, newChildrenIds) => {
        data[item.getId()].children = newChildrenIds;
      });
      alert(
        `Dropped external data with payload "${JSON.stringify(
          dataTransfer.getData("text/plain"),
        )}" on ${target.item.getId()}, index ${target.childIndex}`,
      );
    },
    canDropForeignDragObject: (_, target) => target.item.isFolder(),
    indent: 20,
    dataLoader: syncDataLoader,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  // TODO error: Dragging onto an open folder doesnt trigger rerender

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
        style={{ marginTop: "10px" }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", "hello world");
        }}
      >
        Drag me into the tree!
      </div>
    </>
  );
};
