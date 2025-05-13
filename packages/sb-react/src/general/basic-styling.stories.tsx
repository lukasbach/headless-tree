import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  DragTarget,
  ItemInstance,
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
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/General/Basic Styling",
  tags: ["feature/dnd", "homepage", "guides/styling"],
} satisfies Meta;

export default meta;

const { syncDataLoader, data } = createDemoData();
let newItemId = 0;
const insertNewItem = (dataTransfer: DataTransfer) => {
  const newId = `new-${newItemId++}`;
  data[newId] = {
    name: dataTransfer.getData("text/plain"),
  };
  return newId;
};

const onDropForeignDragObject = (
  dataTransfer: DataTransfer,
  target: DragTarget<DemoItem>,
) => {
  const newId = insertNewItem(dataTransfer);
  insertItemsAtTarget([newId], target, (item, newChildrenIds) => {
    data[item.getId()].children = newChildrenIds;
  });
};
const onCompleteForeignDrop = (items: ItemInstance<DemoItem>[]) =>
  removeItemsFromParents(items, (item, newChildren) => {
    item.getItemData().children = newChildren;
  });
const onRename = (item: ItemInstance<DemoItem>, value: string) => {
  data[item.getId()].name = value;
};
const getCssClass = (item: ItemInstance<DemoItem>) =>
  cn("treeitem", {
    focused: item.isFocused(),
    expanded: item.isExpanded(),
    selected: item.isSelected(),
    folder: item.isFolder(),
    drop: item.isDragTarget(),
    searchmatch: item.isMatchingSearch(),
  });

// story-start
export const BasicStyling = () => {
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
    onRename,
    onDropForeignDragObject,
    onCompleteForeignDrop,
    createForeignDragObject: (items) => ({
      format: "text/plain",
      data: items.map((item) => item.getId()).join(","),
    }),
    canDropForeignDragObject: (_, target) => target.item.isFolder(),
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
      {tree.isSearchOpen() && (
        <div>
          <input {...tree.getSearchInputElementProps()} />
          <span>({tree.getSearchMatchingItems().length} matches)</span>
        </div>
      )}
      <div {...tree.getContainerProps()}>
        <AssistiveTreeDescription tree={tree} />
        {tree.getItems().map((item) => (
          <Fragment key={item.getId()}>
            {item.isRenaming() ? (
              <div style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}>
                <input {...item.getRenameInputProps()} />
              </div>
            ) : (
              <button
                {...item.getProps()}
                style={{
                  border: "1px solid #eee",
                  background: item.isSelected() ? "lightblue" : "white",
                  padding: `4px 0 4px ${item.getItemMeta().level * 20}px`,
                  display: "block",
                  width: "200px",
                  textAlign: "left",
                }}
              >
                <div>
                  {item.isFolder() ? (item.isExpanded() ? "[-]" : "[+]") : ""}{" "}
                  {item.getItemName()}
                </div>
              </button>
            )}
          </Fragment>
        ))}
        <div
          style={{
            ...tree.getDragLineStyle(),
            background: "black",
            height: "3px",
          }}
        />
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
        <div
          className="foreign-dropzone"
          onDrop={(e) => {
            alert(JSON.stringify(e.dataTransfer.getData("text/plain")));
            console.log(e.dataTransfer.getData("text/plain"));
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          Drop items here!
        </div>
        <button className="actionbtn" onClick={() => tree.openSearch()}>
          Search items
        </button>
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
