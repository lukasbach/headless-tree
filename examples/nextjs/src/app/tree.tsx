"use client";

import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import {
  asyncDataLoaderFeature,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
} from "@headless-tree/core";
import cn from "classnames";
import { DemoItem, asyncDataLoader, data } from "@/data";

import "../style.css";

export const Tree = () => {
  const tree = useTree<DemoItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana", "orange"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData()?.name,
    isItemFolder: (item) => !!item.getItemData()?.children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    indent: 20,
    dataLoader: asyncDataLoader,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  const items = tree.getItems();

  return (
    <div {...tree.getContainerProps()} className="tree">
      <AssistiveTreeDescription tree={tree} />
      {items.map((item) => (
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
  );
};
