import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
  TreeItemInstance,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { action } from "storybook/actions";
import cn from "classnames";
import { PropsOfArgtype } from "../argtypes";

const meta = {
  title: "React/Drag and Drop/Kitchen Sink",
  tags: ["feature/dnd", "complex-story", "homepage"],
  argTypes: {
    canReorder: {
      type: "boolean",
    },
    canDropForeignDragObject: {
      type: "boolean",
    },
    reorderAreaPercentage: {
      type: "number",
      control: { type: "number", min: 0, max: 1, step: 0.1 },
      defaultValue: 0.2,
    },
  },
  args: {
    canReorder: true,
    canDropForeignDragObject: true,
  },
} satisfies Meta;

export default meta;

const STATIC_FEATURES = [
  syncDataLoaderFeature,
  selectionFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
];

const mockDataLoader = {
  getItem: (itemId: string) => itemId,
  getChildren: (itemId: string) => [
    `${itemId}-1`,
    `${itemId}-2`,
    `${itemId}-3`,
    `${itemId}-4`,
    `${itemId}-5`,
    `${itemId}-6`,
  ],
};

const createForeignDragObject = (items: TreeItemInstance<string>[]) => ({
  format: "text/plain",
  data: `custom foreign drag object: ${items.map((item) => item.getId()).join(",")}`,
});

const handleDropAction = action("onDrop");
const handleDropForeignDragObjectAction = action("onDropForeignDragObject");
const handleExternalDropAction = action("onDropExternally");

interface TreeItemRowProps {
  item: TreeItemInstance<string>;
}

const TreeItemRow = React.memo(({ item }: TreeItemRowProps) => {
  return (
    <button
      {...item.getProps()}
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
  );
});

TreeItemRow.displayName = "TreeItemRow";

const ExternalDropTarget = () => (
  <div
    style={{ marginTop: "40px" }}
    onDrop={(e) => handleExternalDropAction(e.dataTransfer.getData("text/plain"))}
    onDragOver={(e) => e.preventDefault()}
  >
    Drop items here!
  </div>
);

const ExternalDraggableSource = () => (
  <div
    style={{ marginTop: "10px" }}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", "hello world");
    }}
  >
    Or drag me into the tree!
  </div>
);

export const KitchenSink = ({
  canReorder,
  canDropForeignDragObject,
  reorderAreaPercentage,
}: PropsOfArgtype<typeof meta>) => {
  const [state, setState] = useState({});

  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canReorder,
    reorderAreaPercentage,
    canDropForeignDragObject: () => canDropForeignDragObject ?? false,
    createForeignDragObject,
    onDrop: handleDropAction,
    onDropForeignDragObject: handleDropForeignDragObjectAction,
    indent: 20,
    dataLoader: mockDataLoader,
    features: STATIC_FEATURES,
  });

  const dragLineStyle = tree.getDragLineStyle();

  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        <AssistiveTreeDescription tree={tree} />
        
        {tree.getItems().map((item) => (
          <TreeItemRow key={item.getId()} item={item} />
        ))}
        
        <div style={dragLineStyle} className="dragline" />
      </div>

      <ExternalDropTarget />
      <ExternalDraggableSource />
    </>
  );
};
