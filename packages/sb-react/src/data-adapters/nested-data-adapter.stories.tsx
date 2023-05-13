import type { Meta } from "@storybook/react";
import React, { useState, useMemo } from "react";
import {
  DropTarget,
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
  nestedDataAdapter,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";

const meta = {
  title: "React/Data Adapters/Nested Data Adapter",
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

export const NestedDataAdapter = ({ canDropInbetween }) => {
  const [dnd, setDnd] = useState<DropTarget<any> | null>(null);

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
    onUpdateDragPosition: setDnd,
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
              className="treeitem"
              data-focused={item.isFocused()}
              data-expanded={item.isExpanded()}
              data-selected={item.isSelected()}
              data-drop={item.isDropTarget() && item.isDraggingOver()}
              data-dropabove={item.isDropTargetAbove() && item.isDraggingOver()}
              data-dropbelow={item.isDropTargetBelow() && item.isDraggingOver()}
            >
              {!item.isFolder() ? "" : item.isExpanded() ? "v " : "> "}
              {item.getItemName()}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
