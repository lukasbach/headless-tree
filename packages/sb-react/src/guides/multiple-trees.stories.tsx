import type { Meta } from "@storybook/react";
import React from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  removeItemsFromParents,
  selectionFeature,
  syncDataLoaderFeature,
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

    // onDrop is only called when moving items WITHIN one tree.
    // This handles the entire move operation.
    // Normally you can use `createOnDropHandler` for that, this just shows
    // demonstrates how to do with the individual handlers.
    onDrop: (items, target) => {
      const itemIds = items.map((item) => item.getId());
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
      insertItemsAtTarget(itemIds, target, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
    },

    // When moving items out of the tree, this is used to serialize the
    // dragged items as foreign drag object
    createForeignDragObject: (items) => ({
      format: "text/plain",
      data: JSON.stringify(items.map((item) => item.getId())),
    }),

    // This is called in the target tree when the foreign drag object is
    // dropped. This handler inserts the moved items
    onDropForeignDragObject: (dataTransfer, target) => {
      const newChildrenIds = JSON.parse(dataTransfer.getData("text/plain"));
      insertItemsAtTarget(newChildrenIds, target, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
    },

    // This is called in the source tree when the foreign drag is completed.
    // This handler removes the moved items from the source tree.
    onCompleteForeignDrop: (items) => {
      removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
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
        <button
          {...item.getProps()}
          ref={item.registerElement}
          key={item.getId()}
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <div
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
          </div>
        </button>
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
