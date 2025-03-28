import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  DropTarget,
  ItemInstance,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  removeItemsFromParents,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Drag and Drop/Visible Assistive Text",
  tags: ["feature/dnd", "homepage"],
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
  target: DropTarget<DemoItem>,
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
const getCssClass = (item: ItemInstance<DemoItem>) =>
  cx("treeitem", {
    focused: item.isFocused(),
    expanded: item.isExpanded(),
    selected: item.isSelected(),
    folder: item.isFolder(),
    drop: item.isDropTarget(),
  });

// story-start
export const VisibleAssistiveText = () => {
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
    ],
  });

  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        <p className="description">
          The text below is the default description rendered by{" "}
          {"<AssistiveTreeDescription />"}, which explains the drag-process to
          assistive software. It is normally hidden to the visuals of the
          webpage, but forced to be visible in this sample for demonstration
          purposes:
        </p>
        <AssistiveTreeDescription
          tree={tree}
          className="visible-assistive-text description"
        />
        {tree.getItems().map((item) => (
          <button
            key={item.getId()}
            {...item.getProps()}
            style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
          >
            <div className={getCssClass(item)}>{item.getItemName()}</div>
          </button>
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
      </div>
    </>
  );
};
