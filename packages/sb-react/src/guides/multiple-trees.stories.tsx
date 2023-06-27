import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  createOnDropHandler,
  insertItemsAtTarget,
  removeItemsFromParents,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Guides/Multiple Trees",
} satisfies Meta;

export default meta;

// story-start
type Item = {
  name: string;
  children?: string[];
};

const data1: Record<string, Item> = {
  root: { name: "Root", children: ["lunch", "dessert"] },
  lunch: { name: "Lunch", children: ["sandwich", "salad", "soup"] },
  sandwich: { name: "Sandwich" },
  salad: { name: "Salad" },
  soup: { name: "Soup", children: ["tomato", "chicken"] },
  tomato: { name: "Tomato" },
  chicken: { name: "Chicken" },
  dessert: { name: "Dessert", children: ["icecream", "cake"] },
  icecream: { name: "Icecream" },
  cake: { name: "Cake" },
};

const data2 = JSON.parse(JSON.stringify(data1));

const Tree = (props: { data: Record<string, Item>; prefix: string }) => {
  const tree = useTree<Item>({
    rootItemId: "root",
    dataLoader: {
      getItem: (id) => props.data[id],
      getChildren: (id) => props.data[id]?.children ?? [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canDropInbetween: true,
    onDrop: (items, target) => {
      console.log("onDrop", items, target);
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren.map((child) => child.getId());
      });
      insertItemsAtTarget(items, target, (item, newChildren) => {
        console.log(
          "insert",
          items.map((i) => i.getId()),
          item.getId(),
          newChildren.map((i) => i.getId()),
          target
        );
        item.getItemData().children = newChildren.map((child) => child.getId());
      });
      // TODO move out here?
      // tree.rebuildTree();
    },
    onDropForeignDragObject: (dataTransfer, target) => {
      // // TODO dataTransfer transfers item data, but onDrop actually requires item instances. This needs to be fixed in the data adapter.
      for (const item of JSON.parse(dataTransfer.getData("text/plain"))) {
        // TODO insert items into data structure
      }
      // TODO pass item ids as new children
      // insertItemsAtTarget(items, target, (item, newChildren) => {
      //   item.getItemData().children = newChildren.map((child) => child.getId());
      // });
    },
    onCompleteForeignDrop: (items) => {
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren.map((child) => child.getId());
      });
    },
    createForeignDragObject: (items) => {
      console.log(items);
      return {
        format: "text/plain",
        data: JSON.stringify(items.map((item) => item.getItemData())),
      };
    },
    canDropForeignDragObject: () => true,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  // TODO tree props, role=tree and aria-label
  return (
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
          className="treeitem-parent"
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <button
            {...item.getProps()}
            ref={item.registerElement}
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
              drop: item.isDropTarget() && item.isDraggingOver(),
              dropabove: item.isDropTargetAbove() && item.isDraggingOver(),
              dropbelow: item.isDropTargetBelow() && item.isDraggingOver(),
            })}
          >
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};

export const MultipleTrees = () => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "200px", marginRight: "20px" }}>
        <Tree data={data1} prefix="a" />
      </div>
      <div style={{ width: "200px", marginRight: "20px" }}>
        <Tree data={data2} prefix="b" />
      </div>
    </div>
  );
};
