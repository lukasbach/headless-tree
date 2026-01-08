import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeState,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Drag and Drop/Seperate Drag Handle",
  tags: ["feature/dnd", "basic"],
} satisfies Meta;

export default meta;

// story-start
export const SeperateDragHandle = () => {
  const [state, setState] = useState<Partial<TreeState<any>>>({
    expandedItems: ["root-1", "root-1-2"],
    selectedItems: ["root-1-2-1", "root-1-2-2"],
  });
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canReorder: true,
    seperateDragHandle: true,
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId(),
        )} on ${target.item.getId()}, ${JSON.stringify(target)}`,
      );
    },
    indent: 20,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-4`,
      ],
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
      <AssistiveTreeDescription tree={tree} />
      {tree.getItems().map((item) => (
        <button
          {...item.getProps()}
          key={item.getId()}
          style={{
            paddingLeft: `${item.getItemMeta().level * 20}px`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            {...item.getDragHandleProps()}
            className="drag-handle"
            title="Drag handle - click and drag to move this item"
          >
            ⋮⋮
          </span>
          <div
            className={cn("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
              drop: item.isDragTarget(),
            })}
            style={{ flex: 1 }}
          >
            {item.getItemName()}
          </div>
        </button>
      ))}
      <div style={tree.getDragLineStyle()} className="dragline" />
    </div>
  );
};
