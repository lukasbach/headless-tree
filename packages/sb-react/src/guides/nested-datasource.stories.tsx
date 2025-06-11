import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  removeItemsFromParents,
  renamingFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem } from "../utils/data";

const meta = {
  title: "React/Guides/Nested Datasource",
  tags: [],
} satisfies Meta;

export default meta;

const data = {
  name: "Root",
  children: [
    {
      name: "Fruit",
      children: [
        { name: "Banana" },
        { name: "Orange" },
        { name: "Apple" },
        { name: "Grape" },
      ],
    },
    {
      name: "Vegetables",
      children: [
        { name: "Carrot" },
        { name: "Potato" },
        { name: "Broccoli" },
        { name: "Spinach" },
      ],
    },
  ],
};

// TODO
let newItemId = 0;
const insertNewItem = (dataTransfer: DataTransfer) => {
  const newId = `new-${newItemId++}`;
  data[newId] = {
    name: dataTransfer.getData("text/plain"),
  };
  return newId;
};

// story-start
export const NestedDatasource = () => {
  const tree = useTree<DemoItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana", "orange"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    onRename: (item, value) => {
      data[item.getId()].name = value;
    },
    onDropForeignDragObject: (dataTransfer, target) => {
      const newId = insertNewItem(dataTransfer);
      insertItemsAtTarget([newId], target, (item, newChildrenIds) => {
        data[item.getId()].children = newChildrenIds;
      });
    },
    onCompleteForeignDrop: (items) =>
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      }),
    indent: 20,
    dataLoader: syncDataLoader,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      renamingFeature,
      searchFeature,
    ],
  });

  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <Fragment key={item.getId()}>
            {item.isRenaming() ? (
              <div
                className="renaming-item"
                style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
              >
                <input {...item.getRenameInputProps()} />
              </div>
            ) : (
              <button
                {...item.getProps()}
                style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
              >
                <div
                  className={cn("treeitem", {
                    focused: item.isFocused(),
                    expanded: item.isExpanded(),
                    selected: item.isSelected(),
                    folder: item.isFolder(),
                    drop: item.isDragTarget(),
                    searchmatch: item.isMatchingSearch(),
                  })}
                >
                  {item.getItemName()}
                </div>
              </button>
            )}
          </Fragment>
        ))}
        <div style={tree.getDragLineStyle()} className="dragline" />
      </div>

      <div className="actionbar">
        <div
          className="foreign-dragsource"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", "hello world");
          }}
        >
          Drag me into the tree!
        </div>
        <button
          className="actionbtn"
          onClick={() => tree.getItemInstance("fruit").startRenaming()}
        >
          Rename Fruit
        </button>
      </div>
    </>
  );
};
