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
  title: "React/Guides/Multiple Trees",
} satisfies Meta;

export default meta;

// story-start
type Item = {
  name: string;
  children?: Item[];
};

const data1: Item = {
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

const data2: Item = {
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

const Tree = (props: { data: Item; prefix: string }) => {
  const dataAdapter = nestedDataAdapter<Item>({
    rootItem: props.data,
    getChildren: (item) => item.children,
    getItemId: (item) => props.prefix + item.name,
    changeChildren: (item, children) => {
      item.children = children;
    },
  });

  const tree = useTree<Item>({
    ...dataAdapter,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canDropInbetween: true,
    onDropForeignDragObject: (dataTransfer, target) => {
      console.log(
        "onDropForeignDragObject",
        dataTransfer.getData("text/plain"),
        dataAdapter
      );
      // TODO dataTransfer transfers item data, but onDrop actually requires item instances. This needs to be fixed in the data adapter.
      dataAdapter.onDrop?.(
        JSON.parse(dataTransfer.getData("text/plain")),
        target
      );
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
