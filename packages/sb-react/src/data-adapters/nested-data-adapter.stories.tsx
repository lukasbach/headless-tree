import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  nestedDataAdapter,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Data Adapters/Nested Data Adapter",
  tags: ["feature/nested-data-adapter"],
  argTypes: {
    canDropInbetween: {
      control: "boolean",
    },
  },
  args: {
    canDropInbetween: true,
  },
} satisfies Meta;

export default meta;

// story-start
type Item = {
  name: string;
  children?: Item[];
};

const data: Item = {
  name: "Root item",
  children: [
    {
      name: "Item 1",
      children: [
        {
          name: "Item 1.1",
          children: [
            {
              name: "Item 1.1.1",
            },
            {
              name: "Item 1.1.2",
            },
            {
              name: "Item 1.1.3",
            },
          ],
        },
        {
          name: "Item 1.2",
        },
      ],
    },
    {
      name: "Item 2",
      children: [
        {
          name: "Item 2.1",
        },
        {
          name: "Item 2.2",
        },
      ],
    },
  ],
};

// TODO when dropping an item into a closed folder, this breaks "cannot read properties of undefined, reading name)

export const NestedDataAdapter = ({ canDropInbetween }) => {
  const dataAdapter = nestedDataAdapter<Item>({
    rootItem: data,
    getChildren: (item) => item.children,
    getItemId: (item) => item.name,
    changeChildren: (item, children) => {
      item.children = children;
    },
  });

  const tree = useTree<Item>({
    ...dataAdapter,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canDropInbetween,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  return (
    <>
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
    </>
  );
};
