import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeState,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
  TreeItemInstance,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Drag and Drop/Drag Preview",
  tags: ["feature/dnd"],
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
  ],
};

const handleDrop = (items: TreeItemInstance<string>[], target: any) => {
  alert(
    `Dropped ${items.map((item) => item.getId())} on ${target.item.getId()}, ${JSON.stringify(target)}`
  );
};

const handleSetDragImage = () => ({
  imgElement: document.getElementById("dragpreview")!,
  xOffset: -20,
});

interface CustomDragPreviewProps {
  draggedItems?: TreeItemInstance<string>[];
}

const CustomDragPreview = React.memo(({ draggedItems }: CustomDragPreviewProps) => {
  return (
    <div
      id="dragpreview"
      style={{
        position: "absolute",
        left: "-9999px",
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
  );
});

CustomDragPreview.displayName = "CustomDragPreview";

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

export const DragPreview = () => {
  const [state, setState] = useState<Partial<TreeState<string>>>({
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
    onDrop: handleDrop,
    setDragImage: handleSetDragImage,
    indent: 20,
    dataLoader: mockDataLoader,
    features: STATIC_FEATURES,
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
          <TreeItemRow key={item.getId()} item={item} />
        ))}
        
        <div style={tree.getDragLineStyle()} className="dragline" />
        
        <CustomDragPreview draggedItems={draggedItems} />
      </div>
    </>
  );
};
