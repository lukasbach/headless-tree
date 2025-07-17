import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";
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
    canReorder: true,
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
        )}" on ${JSON.stringify(target)}`,
      );
    },
    canDropForeignDragObject: (_, target) =>
      target.item.isFolder() && target.item.getId() !== "drinks",
    indent: 20,
    dataLoader: syncDataLoader,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        <AssistiveTreeDescription tree={tree} />
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
                drop: item.isDragTarget(),
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
        Drag me into the tree! (but not in Drinks)
      </div>
    </>
  );
};
