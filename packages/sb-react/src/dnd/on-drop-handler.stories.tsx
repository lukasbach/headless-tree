import type { Meta } from "@storybook/react";
import React from "react";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Drag and Drop/On Drop Handler",
  tags: ["feature/dnd"],
} satisfies Meta;

export default meta;

// story-start
type Item = {
  name: string;
  children?: string[];
};

const data: Record<string, Item> = {
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

export const OnDropHandler = () => {
  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["lunch", "dessert"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: () => true,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      item.getItemData().children = newChildren;
    }),
    indent: 20,
    dataLoader: {
      getItem: (id) => data[id],
      getChildren: (id) => data[id]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
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
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
              drop: item.isDropTarget(),
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
