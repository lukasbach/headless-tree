import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeInstance,
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
  title: "React/Guides/Advanced Multiple Trees",
  tags: ["feature/dnd", "homepage"],
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

const data2: Record<string, Item> = {
  root: { name: "Root", children: ["solar", "centauri"] },
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
};

/* Return all IDs of items within the given items, even deeply nested ones */
const resolveNestedItems = (
  tree: TreeInstance<Item>,
  items: string[],
): string[] => {
  if (items.length === 0) return [];
  const immediateChildren = items
    .map(tree.getConfig().dataLoader.getChildren)
    .flat() as string[];
  const nestedChildren = resolveNestedItems(tree, immediateChildren);
  return [...items, ...nestedChildren];
};

const Tree = (props: { data: Record<string, Item>; prefix: string }) => {
  const [data, setData] = useState(props.data);
  const tree: TreeInstance<Item> = useTree<Item>({
    rootItemId: "root",
    dataLoader: {
      getItem: (id) => data[id],
      getChildren: (id) => data[id]?.children ?? [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canReorder: true,
    indent: 20,

    // onDrop is only called when moving items WITHIN one tree.
    // This handles the entire move operation.
    // Normally you can use `createOnDropHandler` for that, the following just
    // demonstrates how to do with the individual handlers.
    onDrop: async (items, target) => {
      const itemIds = items.map((item) => item.getId());
      await removeItemsFromParents(items, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
      await insertItemsAtTarget(itemIds, target, (item, newChildren) => {
        item.getItemData().children = newChildren;
      });
    },

    // When moving items out of the tree, this is used to serialize the
    // dragged items as foreign drag object.
    // Since the trees have distinct data sources, we provide the necessary
    // information to move the items to the new data source as well.
    createForeignDragObject: (items) => {
      const nestedItems = resolveNestedItems(
        tree,
        items.map((item) => item.getId()),
      );
      return {
        format: "text/plain",
        data: JSON.stringify({
          items: items.map((item) => item.getId()),
          nestedItems: Object.fromEntries(
            nestedItems.map((id) => [id, props.data[id]]),
          ),
        }),
      };
    },

    // This is called in the target tree to verify if foreign drag objects
    // are permitted to be dropped there.
    canDropForeignDragObject: () => true,

    // This is called in the target tree when the foreign drag object is
    // dropped. This handler inserts the moved items, and also injects
    // the item data into the new data source.
    onDropForeignDragObject: (dataTransfer, target) => {
      const { items, nestedItems } = JSON.parse(
        dataTransfer.getData("text/plain"),
      );
      setData({ ...data, ...nestedItems });
      insertItemsAtTarget(items, target, (item, newChildren) => {
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

export const AdvancedMultipleTrees = () => {
  return (
    <>
      <p className="description">
        This is a more complicated use case than the normal "Multiple Trees"
        story. In this case, several trees each have their own dedicated data
        source. When items are dragged from one tree to the other, all data of
        every nested item that is part of the selection is sent in the drag
        event, and attached to the new data source in the target tree.
      </p>
      <div style={{ display: "flex" }}>
        <div style={{ width: "200px", marginRight: "20px" }}>
          <Tree data={data1} prefix="a" />
        </div>
        <div style={{ width: "200px", marginRight: "20px" }}>
          <Tree data={data2} prefix="b" />
        </div>
      </div>
    </>
  );
};
