import type { Meta } from "@storybook/react";
import React, { Fragment, useState } from "react";
import {
  ItemInstance,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  renamingFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem, createDemoData } from "../../utils/data";

const meta = {
  title: "React/Guides/External Data Management/Data In React State",
  tags: ["guide", "external data"],
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
export const DataInReactState = () => {
  const [treeData, setTreeData] = useState(() => createDemoData().data);

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
      setTreeData((prev) => ({
        ...prev,
        [item.getId()]: {
          ...prev[item.getId()],
          children: newChildren,
        },
      }));
    }),
    onRename: (item, value) =>
      setTreeData((prev) => ({
        ...prev,
        [item.getId()]: {
          ...prev[item.getId()],
          name: value,
        },
      })),
    indent: 20,
    dataLoader: {
      getItem: (id: string) => treeData[id],
      getChildren: (id: string) => treeData[id]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
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
      setTreeData((prev) => ({
        ...prev,
        [newId]: { name: dataTransfer.getData("text/plain") },
      }));
      await insertItemsAtTarget([newId], target, (item, newChildrenIds) => {
        setTreeData((prev) => {
          const newData = { ...prev };
          newData[item.getId()] = {
            ...newData[item.getId()],
            children: newChildrenIds,
          };
          return newData;
        });
      });
      tree.scheduleRebuildTree();
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
                    const parent = item.getParent()?.getId();
                    if (!parent) return;
                    setTreeData((prev) => {
                      // This only removes the item itself, not nested children. Depending
                      // on your use case, you might want to do that as well.
                      const newData = { ...prev };
                      delete newData[item.getId()];
                      newData[parent].children = newData[
                        parent
                      ].children?.filter((id) => id !== item.getId());
                      return newData;
                    });
                    tree.scheduleRebuildTree();
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
            const parent = tree.getItemInstance("fruit").getParent()?.getId();
            if (!parent) return;
            setTreeData((prev) => {
              const newData = { ...prev };
              delete newData.fruit;
              newData[parent].children = newData[parent].children?.filter(
                (id) => id !== "fruit",
              );
              return newData;
            });
            tree.scheduleRebuildTree();
          }}
        >
          Delete Fruit
        </button>
        <button
          className="actionbtn"
          onClick={() => {
            setTreeData((prev) => {
              const newData = { ...prev };
              const newId = `new-${newItemId++}`;
              newData[newId] = { name: "New item" };
              newData.fruit.children = [...newData.fruit.children!, newId];
              return newData;
            });
            tree.scheduleRebuildTree();
          }}
        >
          Insert new item into Fruit
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
      <pre>{JSON.stringify(treeData, null, 2)}</pre>
    </>
  );
};
