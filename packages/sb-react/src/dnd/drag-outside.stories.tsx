import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  removeItemsFromParents,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Drag and Drop/Drag Outside",
  tags: ["feature/dnd"],
} satisfies Meta;

export default meta;

const [dataLoader, data] = createDemoData();

// story-start
export const DragOutside = () => {
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
    createForeignDragObject: (items) => ({
      format: "text/plain",
      data: `custom foreign drag object: ${items
        .map((item) => item.getId())
        .join(",")}`,
    }),
    indent: 20,
    dataLoader,
    onCompleteForeignDrop: (items) => {
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
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
          alert(
            `Drop, dataTransfer payload is ${JSON.stringify(
              e.dataTransfer.getData("text/plain"),
            )}`,
          )
        }
        onDragOver={(e) => e.preventDefault()}
      >
        Drop items here!
      </div>
    </>
  );
};
