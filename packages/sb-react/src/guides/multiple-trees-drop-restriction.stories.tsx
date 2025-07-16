import type { Meta } from "@storybook/react";
import React from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  keyboardDragAndDropFeature,
  removeItemsFromParents,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Guides/Multiple Trees Drop Restriction",
  tags: ["feature/dnd"],
} satisfies Meta;

export default meta;

// story-start
type Item = {
  name: string;
  children?: string[];
};

const data: Record<string, Item> = {
  root1: { name: "Root", children: ["lunch", "dessert"] },
  root2: {
    name: "Root",
    children: ["solar", "centauri", "cannotdrop1", "cannotdrop2"],
  },
  lunch: { name: "Lunch", children: ["sandwich", "salad", "soup"] },
  sandwich: { name: "Sandwich" },
  salad: { name: "Salad" },
  soup: { name: "Soup", children: ["tomato", "chicken"] },
  tomato: { name: "Tomato" },
  chicken: { name: "Chicken" },
  dessert: { name: "Dessert", children: ["icecream", "cake"] },
  icecream: { name: "Icecream" },
  cake: { name: "Cake" },
  solar: {
    name: "Solar System",
    children: ["jupiter", "earth", "mars", "venus"],
  },
  jupiter: { name: "Jupiter", children: ["io", "europa", "ganymede"] },
  io: { name: "Io" },
  europa: { name: "Europa" },
  ganymede: { name: "Ganymede" },
  earth: { name: "Earth", children: ["moon"] },
  moon: { name: "Moon" },
  mars: { name: "Mars" },
  venus: { name: "Venus" },
  centauri: {
    name: "Alpha Centauri",
    children: ["rigilkent", "toliman", "proxima"],
  },
  rigilkent: { name: "Rigel Kentaurus" },
  toliman: { name: "Toliman" },
  proxima: { name: "Proxima Centauri" },
  cannotdrop1: { name: "Cannot Drop in other Tree 1" },
  cannotdrop2: { name: "Cannot Drop in other Tree 2" },
};

const Tree = (props: { root: string; prefix: string }) => {
  const tree = useTree<Item>({
    rootItemId: props.root,
    dataLoader: {
      getItem: (id) => data[id],
      getChildren: (id) => data[id]?.children ?? [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canReorder: true,
    indent: 20,

    // When moving items out of the tree, this is used to serialize the
    // dragged items as foreign drag object
    createForeignDragObject: (items) => ({
      format: "text/plain",
      data: JSON.stringify(items.map((item) => item.getId())),
      effectAllowed: items.some((item) => item.getId().includes("cannotdrop"))
        ? "none"
        : "copy",
    }),

    // Called before dropping to check if foreign drag object can be dropped
    canDropForeignDragObject: (dataTransfer) =>
      !dataTransfer.getData("text/plain").includes("cannotdrop"),

    // Called on every drag over to determine if a draggable visualization should be shown
    canDragForeignDragObjectOver: (dataTransfer) =>
      dataTransfer.effectAllowed !== "none",

    // Remaining drop logic. This is the same as in "Multiple Trees", see this example for more
    // details on that logic.
    onDrop: async (items, target) => {
      const itemIds = items.map((item) => item.getId());
      await removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
      await insertItemsAtTarget(itemIds, target, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
    },
    onDropForeignDragObject: (dataTransfer, target) => {
      const newChildrenIds = JSON.parse(dataTransfer.getData("text/plain"));
      insertItemsAtTarget(newChildrenIds, target, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
    },
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

export const MultipleTreesDropRestriction = () => {
  return (
    <>
      <p className="description">
        In this case, "canDragForeignDragObjectOver" is used to determine if a
        foreign drag object can be dragged over a target.
      </p>
      <div style={{ display: "flex" }}>
        <div style={{ width: "200px", marginRight: "20px" }}>
          <Tree root="root1" prefix="a" />
        </div>
        <div style={{ width: "200px", marginRight: "20px" }}>
          <Tree root="root2" prefix="b" />
        </div>
      </div>
    </>
  );
};
