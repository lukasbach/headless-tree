import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  ItemInstance,
  asyncDataLoaderFeature,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  renamingFeature,
  searchFeature,
  selectionFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem, createDemoData } from "../../utils/data";

const meta = {
  title: "React/Guides/External Data Management/Async Data",
  tags: ["guide", "guide/externaldata"],
} satisfies Meta;

export default meta;

let newItemId = 0;

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
// Data is of type `Record<string, DemoItem>`
const { asyncDataLoader, data } = createDemoData();

export const AsyncData = () => {
  const tree = useTree<DemoItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana", "orange"],
    },
    rootItemId: "root",
    createLoadingItemData: () => ({ name: "Loading..." }),
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    onRename: (item, value) => {
      data[item.getId()].name = value;
      item.updateCachedData({ ...item.getItemData(), name: value });
    },
    indent: 20,
    dataLoader: asyncDataLoader,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      renamingFeature,
      searchFeature,
    ],

    // For dragging foreign items into the tree:
    canDropForeignDragObject: (_, target) => target.item.isFolder(),
    onDropForeignDragObject: async (dataTransfer, target) => {
      const newId = `new-${newItemId++}`;
      data[newId] = { name: dataTransfer.getData("text/plain") };
      await insertItemsAtTarget([newId], target, (item, newChildrenIds) => {
        data[item.getId()].children = newChildrenIds;
      });
    },
  });

  return (
    <>
      {tree.isSearchOpen() && (
        <div className="searchbox">
          <input {...tree.getSearchInputElementProps()} />
          <span>({tree.getSearchMatchingItems().length} matches)</span>
        </div>
      )}
      <div {...tree.getContainerProps()} className="tree">
        <AssistiveTreeDescription tree={tree} />
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
              <div className="outeritem">
                <button
                  {...item.getProps()}
                  style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
                >
                  <div className={getCssClass(item)}>{item.getItemName()}</div>
                </button>
                <button
                  onClick={() => {
                    const parent = item.getParent();
                    if (!parent) return;
                    delete data[item.getId()];
                    const newParentChildren = data[
                      parent.getId()
                    ].children?.filter((id) => id !== item.getId());
                    data[parent.getId()].children = newParentChildren;
                    parent.updateCachedChildrenIds(newParentChildren ?? []);
                    tree.rebuildTree();
                  }}
                >
                  delete
                </button>
                <button onClick={() => item.startRenaming()}>rename</button>
              </div>
            )}
          </Fragment>
        ))}
        <div style={tree.getDragLineStyle()} className="dragline" />
      </div>

      <div className="actionbar">
        <button className="actionbtn" onClick={() => tree.openSearch()}>
          Search items
        </button>
        <button
          className="actionbtn"
          onClick={() => tree.getItemInstance("fruit").startRenaming()}
        >
          Rename Fruit
        </button>
        <button
          className="actionbtn"
          onClick={() => {
            const parent = tree.getItemInstance("fruit").getParent();
            if (!parent) return;
            delete data.fruit;
            const newParentChildren = data[parent.getId()].children?.filter(
              (id) => id !== "fruit",
            );
            data[parent.getId()].children = newParentChildren;
            parent.updateCachedChildrenIds(newParentChildren ?? []);
            tree.rebuildTree();
          }}
        >
          Delete Fruit
        </button>
        <button
          className="actionbtn"
          onClick={() => {
            if (!data.fruit) return;
            const newId = `new-${newItemId++}`;
            data[newId] = { name: "New item" };
            data.fruit.children = [...(data.fruit.children || []), newId];
            tree
              .getItemInstance("fruit")
              .updateCachedChildrenIds(data.fruit.children);
            tree.rebuildTree();
          }}
        >
          Insert new item into fruit
        </button>
        <div
          className="foreign-dragsource"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", "hello world");
          }}
        >
          Drag me into the tree!
        </div>
      </div>
    </>
  );
};
