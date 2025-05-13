import type { Meta } from "@storybook/react";
import React from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem, createDemoData, unitTestTree } from "./data";

const meta = {
  title: "React/Misc/Sync Tree used in Unit Tests",
  tags: ["misc/unittest", "dev"],
} satisfies Meta;

const { data, syncDataLoader } = createDemoData(unitTestTree);

export default meta;

// story-start
export const UnitTestSync = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "x",
    createLoadingItemData: () => ({ name: "Loading" }),
    dataLoader: syncDataLoader,
    getItemName: (item) => item.getItemData().name,
    indent: 20,
    isItemFolder: (item) => item.getItemMeta().level < 2,
    initialState: {
      expandedItems: ["x1", "x11", "x2", "x21"],
    },
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
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
  );
};
