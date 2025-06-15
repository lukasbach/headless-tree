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
  title: "React/Drag and Drop/Drag Preview",
  tags: ["feature/dnd"],
} satisfies Meta;

export default meta;

// story-start
export const DragPreview = () => {
  const [state, setState] = useState<Partial<TreeState<any>>>({
    expandedItems: ["root-1", "root-1-2"],
    selectedItems: ["root-1-2-1", "root-1-2-2", "root-1-2-3", "root-1-2-4"],
  });
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    canReorder: true,
    onDrop: (items, target) => {
      alert(
        `Dropped ${items.map((item) =>
          item.getId(),
        )} on ${target.item.getId()}, ${JSON.stringify(target)}`,
      );
    },
    setDragImage: () => ({
      imgElement: document.getElementById("dragpreview")!,
      xOffset: -20,
    }),
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

  const draggedItems = tree.getState().dnd?.draggedItems;

  return (
    <>
      <p className="description">
        This sample utilizes custom drag previews that are defined with the
        option setDragImage. Start dragging items to see the custom preview.
      </p>
      <div {...tree.getContainerProps()} className="tree">
        <AssistiveTreeDescription tree={tree} />
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
        <div
          id="dragpreview"
          style={{
            // move the drag preview off-screen by default
            position: "absolute",
            left: "-9999px",

            // styling to make it look nice
            width: "200px",
            background: "white",
            borderRadius: "4px",
            border: "1px solid #eee",
            padding: "4px",
          }}
        >
          Dragging{" "}
          {draggedItems
            ?.slice(0, 3)
            .map((item) => item.getItemName())
            .join(", ")}
          {(draggedItems?.length ?? 0) > 3 &&
            ` and ${(draggedItems?.length ?? 0) - 3} more`}
        </div>
      </div>
    </>
  );
};
